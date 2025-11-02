const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const locationFilter = require('../middleware/locationFilter');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Get all transfers from user's location
router.get('/', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM transfers 
      WHERE from_location_id = ? OR to_location_id = ?
      ORDER BY transfer_date DESC
    `);
    const transfers = stmt.all(req.locationId, req.locationId);
    
    res.json({
      success: true,
      data: transfers
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create transfer
router.post('/', locationFilter, (req, res) => {
  try {
    const { transfer_number, from_location_id, to_location_id, notes } = req.body;

    // User can only create transfer FROM their location
    if (from_location_id !== req.locationId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Can only transfer from your location' });
    }

    const transferId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO transfers (id, transfer_number, from_location_id, to_location_id, status, created_by)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `);

    stmt.run(transferId, transfer_number, from_location_id, to_location_id, req.user.id);

    res.json({
      success: true,
      message: 'Transfer created successfully',
      transferId: transferId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;