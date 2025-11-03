const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'inventory.db');

console.log('Creating database tables...');

try {
  const db = new Database(dbPath);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'staff',
      location_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      clover_merchant_id TEXT,
      clover_access_token TEXT,
      clover_connected_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      phone TEXT,
      email TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      cost REAL,
      price REAL,
      barcode TEXT,
      reorder_point INTEGER DEFAULT 10,
      reorder_quantity INTEGER DEFAULT 50,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      clover_id TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      location_id TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      reserved_quantity INTEGER DEFAULT 0,
      last_counted TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zip TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      location_id TEXT,
      status TEXT DEFAULT 'draft',
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      expected_date TIMESTAMP,
      received_date TIMESTAMP,
      total_amount REAL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT UNIQUE NOT NULL,
      from_location_id TEXT NOT NULL,
      to_location_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      received_date TIMESTAMP,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_location_id) REFERENCES locations(id),
      FOREIGN KEY (to_location_id) REFERENCES locations(id)
    );
  `);

  console.log('✅ Database tables created successfully');
  db.close();

} catch (err) {
  console.error('❌ Database error:', err.message);
  process.exit(1);
}