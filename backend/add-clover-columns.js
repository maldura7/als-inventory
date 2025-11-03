const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'inventory.db');
const db = new Database(dbPath);

console.log('Adding Clover columns to database...');

try {
  // Add columns to users table
  db.exec(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS clover_merchant_id TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS clover_access_token TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS clover_connected_at TIMESTAMP;
  `);

  // Add column to products table
  db.exec(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS clover_id TEXT;
  `);

  console.log('✅ Clover columns added successfully!');
} catch (err) {
  console.error('❌ Error adding columns:', err.message);
}

db.close();