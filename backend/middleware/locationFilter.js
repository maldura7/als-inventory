const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Middleware to check user's location and filter data
const locationFilter = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_minimum_32_characters_long';
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user with location
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Attach user info to request
    req.user = user;
    req.locationId = user.location_id;
    
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = locationFilter;