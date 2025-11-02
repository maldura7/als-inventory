const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const locationFilter = require('../middleware/locationFilter');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Get all purchase orders for user's location
router.get('/', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM purchase_orders 
      WHERE location_id = ?
      ORDER BY order_date DESC
    `);
    const orders = stmt.all(req.locationId);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create purchase order
router.post('/', locationFilter, (req, res) => {
  try {
    const { po_number, supplier_id, location_id, expected_date, notes } = req.body;

    // Verify user has access to this location
    if (location_id !== req.locationId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this location' });
    }

    const poId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO purchase_orders (id, po_number, supplier_id, location_id, status, created_by, notes)
      VALUES (?, ?, ?, ?, 'draft', ?, ?)
    `);

    stmt.run(poId, po_number, supplier_id, location_id, req.user.id, notes || '');

    res.json({
      success: true,
      message: 'Purchase order created successfully',
      poId: poId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;