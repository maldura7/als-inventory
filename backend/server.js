const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

// Initialize database if it doesn't exist
const dbPath = path.join(__dirname, 'database', 'inventory.db');

if (!fs.existsSync(dbPath)) {
  console.log('Initializing database...');
  require('./database/init-database.js');
  console.log('✅ Database initialized');
}

// Seed admin account if it doesn't exist
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

try {
  const db = new Database(dbPath);
  const adminExists = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  
  if (!adminExists) {
    console.log('Creating admin account...');
    const userId = uuidv4();
    const hashedPassword = bcrypt.hashSync('Admin123456', 10);
    
    db.prepare(`
      INSERT INTO users (id, email, password, full_name, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'admin@example.com',
      hashedPassword,
      'Administrator',
      'admin',
      1,
      new Date().toISOString()
    );
    
    console.log('✅ Admin account created');
  }
  db.close();
} catch (err) {
  console.error('Admin seeding error:', err);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, 'public')));

// Serve React app for all non-API routes (SPA routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next(); // Let API routes pass through
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/purchase-orders', require('./routes/purchase-orders'));
app.use('/api/transfers', require('./routes/transfers'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/clover', require('./routes/clover'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Server started successfully`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(`🔗 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}\n`);
});

module.exports = app;