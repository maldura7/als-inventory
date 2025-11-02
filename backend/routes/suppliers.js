const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const locationFilter = require('../middleware/locationFilter');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Get all suppliers
router.get('/', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM suppliers WHERE is_active = 1 ORDER BY name ASC');
    const suppliers = stmt.all();
    
    res.json({
      success: true,
      data: suppliers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create supplier
router.post('/', locationFilter, (req, res) => {
  try {
    const { name, contact_name, email, phone, address, payment_terms } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required' });
    }

    const supplierId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO suppliers (id, name, contact_name, email, phone, address, payment_terms, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    stmt.run(supplierId, name, contact_name || '', email || '', phone || '', address || '', payment_terms || '');

    res.json({
      success: true,
      message: 'Supplier created successfully',
      supplierId: supplierId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;