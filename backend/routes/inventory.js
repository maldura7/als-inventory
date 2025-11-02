const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const locationFilter = require('../middleware/locationFilter');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Get all inventory for user's location
router.get('/', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT i.*, p.name as product_name, p.sku
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.location_id = ?
      ORDER BY p.name ASC
    `);
    const inventory = stmt.all(req.locationId);
    
    res.json({
      success: true,
      data: inventory
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Adjust stock
router.post('/adjust', locationFilter, (req, res) => {
  try {
    const { product_id, location_id, quantity, reason } = req.body;

    // Verify user has access to this location
    if (location_id !== req.locationId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this location' });
    }

    // Check if inventory record exists
    const checkStmt = db.prepare('SELECT * FROM inventory WHERE product_id = ? AND location_id = ?');
    let inventoryRecord = checkStmt.get(product_id, location_id);

    if (!inventoryRecord) {
      // Create new inventory record
      const inventoryId = uuidv4();
      const insertStmt = db.prepare(`
        INSERT INTO inventory (id, product_id, location_id, quantity, reserved_quantity)
        VALUES (?, ?, ?, ?, 0)
      `);
      insertStmt.run(inventoryId, product_id, location_id, quantity);
      inventoryRecord = { id: inventoryId };
    } else {
      // Update existing record
      const updateStmt = db.prepare(`
        UPDATE inventory 
        SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(quantity, inventoryRecord.id);
    }

    // Log stock movement
    const movementId = uuidv4();
    const movementStmt = db.prepare(`
      INSERT INTO stock_movements (id, product_id, location_id, movement_type, quantity, reason, user_id, created_at)
      VALUES (?, ?, ?, 'adjustment', ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    movementStmt.run(movementId, product_id, location_id, quantity, reason || 'Stock adjustment', req.user.id);

    res.json({
      success: true,
      message: 'Inventory adjusted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;