const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');
const locationFilter = require('../middleware/locationFilter');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

// Get all products for user's location
router.get('/', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM products 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `);
    const products = stmt.all();
    
    res.json({
      success: true,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create product
router.post('/', locationFilter, (req, res) => {
  try {
    const { sku, name, description, category, cost, price, barcode, reorder_point, reorder_quantity } = req.body;

    if (!sku || !name || !price) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const productId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO products (id, sku, name, description, category, cost, price, barcode, reorder_point, reorder_quantity, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    stmt.run(productId, sku, name, description || '', category || '', cost || 0, price, barcode || '', reorder_point || 10, reorder_quantity || 50);

    res.json({
      success: true,
      message: 'Product created successfully',
      productId: productId
    });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single product
router.get('/:id', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update product
router.put('/:id', locationFilter, (req, res) => {
  try {
    const { name, description, category, cost, price, reorder_point, reorder_quantity } = req.body;

    const stmt = db.prepare(`
      UPDATE products 
      SET name = ?, description = ?, category = ?, cost = ?, price = ?, reorder_point = ?, reorder_quantity = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(name, description, category, cost, price, reorder_point, reorder_quantity, req.params.id);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete product
router.delete('/:id', locationFilter, (req, res) => {
  try {
    const stmt = db.prepare('UPDATE products SET is_active = 0 WHERE id = ?');
    stmt.run(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;