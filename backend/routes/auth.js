const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user from database
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login
    const updateStmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
    updateStmt.run(user.id);

// Return success response
return res.json({
  success: true,
  message: 'Login successful',
  data: {
    token: token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      location_id: user.location_id
    }
  }
});

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Register endpoint (for creating new users)
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    // Create user
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, full_name, role, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(userId, email, hashedPassword, full_name || '', role || 'staff', 1);

    return res.json({
      success: true,
      message: 'User registered successfully',
      userId: userId
    });

  } catch (err) {
    console.error('Register error:', err);
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Get all users (admin only)
router.get('/users/all', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';
    const decoded = jwt.verify(token, JWT_SECRET);

    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can view users' });
    }

    const usersStmt = db.prepare('SELECT id, email, full_name, role, location_id, is_active, created_at FROM users ORDER BY created_at DESC');
    const users = usersStmt.all();

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get users for a specific location (admin and manager)
router.get('/users/location/:locationId', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';
    const decoded = jwt.verify(token, JWT_SECRET);

    const authUser = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!authUser || (authUser.role !== 'admin' && authUser.location_id !== req.params.locationId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const usersStmt = db.prepare('SELECT id, email, full_name, role, location_id, is_active, created_at FROM users WHERE location_id = ? ORDER BY full_name ASC');
    const users = usersStmt.all(req.params.locationId);

    res.json({
      success: true,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create new user (admin only)
router.post('/users/create', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';
    const decoded = jwt.verify(token, JWT_SECRET);

    const authUser = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!authUser || authUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create users' });
    }

    const { email, password, full_name, role, location_id } = req.body;

    if (!email || !password || !location_id) {
      return res.status(400).json({ success: false, message: 'Email, password, and location are required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO users (id, email, password, full_name, role, location_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    stmt.run(userId, email, hashedPassword, full_name || '', role || 'staff', location_id);

    res.json({
      success: true,
      message: 'User created successfully',
      userId: userId
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user (admin only)
router.put('/users/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';
    const decoded = jwt.verify(token, JWT_SECRET);

    const authUser = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!authUser || authUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can update users' });
    }

    const { full_name, role, location_id, is_active } = req.body;

    const stmt = db.prepare(`
      UPDATE users 
      SET full_name = ?, role = ?, location_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(full_name, role, location_id, is_active ? 1 : 0, req.params.id);

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';
    const decoded = jwt.verify(token, JWT_SECRET);

    const authUser = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!authUser || authUser.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete users' });
    }

    const stmt = db.prepare('UPDATE users SET is_active = 0 WHERE id = ?');
    stmt.run(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;