const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const locationFilter = require('../middleware/locationFilter');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Get all locations
router.get('/', locationFilter, (req, res) => {
  try {
    let stmt;
    let locations;

    // If user is admin, show all locations
    // If user is staff, show only their location
    if (req.user.role === 'admin') {
      stmt = db.prepare('SELECT * FROM locations WHERE is_active = 1 ORDER BY name ASC');
      locations = stmt.all();
    } else {
      stmt = db.prepare('SELECT * FROM locations WHERE id = ? AND is_active = 1');
      locations = [stmt.get(req.locationId)].filter(l => l);
    }
    
    res.json({
      success: true,
      data: locations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create location (admin only)
router.post('/', locationFilter, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create locations' });
    }

    const { name, address, city, state, zip, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Location name is required' });
    }

    const locationId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO locations (id, name, address, city, state, zip, phone, email, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    stmt.run(locationId, name, address || '', city || '', state || '', zip || '', phone || '', email || '');

    res.json({
      success: true,
      message: 'Location created successfully',
      locationId: locationId
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single location
router.get('/:id', locationFilter, (req, res) => {
  try {
    // Check if user has access to this location
    if (req.locationId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const stmt = db.prepare('SELECT * FROM locations WHERE id = ?');
    const location = stmt.get(req.params.id);

    if (!location) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }

    res.json({
      success: true,
      data: location
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update location
router.put('/:id', locationFilter, (req, res) => {
  try {
    // Check if user has access
    if (req.locationId !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { name, address, city, state, zip, phone, email } = req.body;

    const stmt = db.prepare(`
      UPDATE locations 
      SET name = ?, address = ?, city = ?, state = ?, zip = ?, phone = ?, email = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(name, address, city, state, zip, phone, email, req.params.id);

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;