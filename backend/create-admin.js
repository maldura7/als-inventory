// Initialize database if needed
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'inventory.db');

if (!fs.existsSync(dbPath)) {
  console.log('Initializing database first...');
  require('./database/init-database.js');
}
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'inventory.db');
const db = new Database(dbPath);

try {
  // Hash password
  const hashedPassword = bcrypt.hashSync('Admin123456', 10);
  
  // Create admin user
  const userId = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, full_name, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(userId, 'admin@example.com', hashedPassword, 'Administrator', 'admin', 1);
  
  console.log('✅ Admin account created successfully!');
  console.log('Email: admin@example.com');
  console.log('Password: Admin123456');
  
  db.close();
} catch (err) {
  console.error('❌ Error:', err.message);
  if (err.message.includes('UNIQUE')) {
    console.log('ℹ️ Admin account already exists');
  }
  db.close();
}