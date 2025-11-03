const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const authMiddleware = require('../middleware/auth');

const dbPath = path.join(__dirname, '../database/inventory.db');

// Inventory valuation report
router.get('/inventory-value', authMiddleware, (req, res) => {
  try {
    const db = new Database(dbPath);
    const { location_id, category } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (location_id) {
      whereClause += ' AND inventory.location_id = ?';
      params.push(location_id);
    }

    if (category) {
      whereClause += ' AND products.category = ?';
      params.push(category);
    }

    const report = db.prepare(`
      SELECT 
        products.id,
        products.sku,
        products.name,
        products.category,
        products.cost,
        products.price,
        SUM(inventory.quantity) as total_quantity,
        SUM(inventory.quantity * products.cost) as total_cost_value,
        SUM(inventory.quantity * products.price) as total_retail_value
      FROM inventory
      JOIN products ON inventory.product_id = products.id
      WHERE ${whereClause}
      GROUP BY products.id
      ORDER BY total_retail_value DESC
    `).all(...params);

    const summary = db.prepare(`
      SELECT 
        SUM(inventory.quantity) as total_units,
        SUM(inventory.quantity * products.cost) as total_cost_value,
        SUM(inventory.quantity * products.price) as total_retail_value
      FROM inventory
      JOIN products ON inventory.product_id = products.id
      WHERE ${whereClause}
    `).get(...params);

    db.close();

    res.json({
      success: true,
      report,
      summary
    });
  } catch (err) {
    console.error('Inventory value report error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate inventory value report' 
    });
  }
});

// Low stock report
router.get('/low-stock', authMiddleware, (req, res) => {
  try {
    const db = new Database(dbPath);
    const { location_id } = req.query;

    let query = `
      SELECT 
        products.id,
        products.sku,
        products.name,
        products.category,
        products.reorder_point,
        products.reorder_quantity,
        inventory.quantity,
        locations.name as location_name,
        (products.reorder_point - inventory.quantity) as shortage
      FROM inventory
      JOIN products ON inventory.product_id = products.id
      JOIN locations ON inventory.location_id = locations.id
      WHERE inventory.quantity <= products.reorder_point
    `;

    let params = [];

    if (location_id) {
      query += ' AND inventory.location_id = ?';
      params.push(location_id);
    }

    query += ' ORDER BY shortage DESC';

    const report = db.prepare(query).all(...params);
    db.close();

    res.json({
      success: true,
      report,
      total_items_low_stock: report.length
    });
  } catch (err) {
    console.error('Low stock report error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate low stock report' 
    });
  }
});

// ABC Analysis report
router.get('/abc-analysis', authMiddleware, (req, res) => {
  try {
    const db = new Database(dbPath);
    const { location_id } = req.query;

    let whereClause = '1=1';
    const params = [];

    if (location_id) {
      whereClause += ' AND inventory.location_id = ?';
      params.push(location_id);
    }

    const allItems = db.prepare(`
      SELECT 
        products.id,
        products.sku,
        products.name,
        products.category,
        inventory.quantity,
        products.price,
        (inventory.quantity * products.price) as item_value
      FROM inventory
      JOIN products ON inventory.product_id = products.id
      WHERE ${whereClause}
      ORDER BY item_value DESC
    `).all(...params);

    db.close();

    // Calculate total value
    const totalValue = allItems.reduce((sum, item) => sum + (item.item_value || 0), 0);

    // Classify items into A, B, C
    let cumulativeValue = 0;
    const report = allItems.map(item => {
      cumulativeValue += item.item_value || 0;
      const percentage = (cumulativeValue / totalValue) * 100;
      
      let classification = 'C';
      if (percentage <= 80) classification = 'A';
      else if (percentage <= 95) classification = 'B';

      return {
        ...item,
        percentage_of_total: ((item.item_value / totalValue) * 100).toFixed(2),
        classification
      };
    });

    const summary = {
      total_items: report.length,
      total_value: totalValue,
      a_items: report.filter(i => i.classification === 'A').length,
      b_items: report.filter(i => i.classification === 'B').length,
      c_items: report.filter(i => i.classification === 'C').length
    };

    res.json({
      success: true,
      report,
      summary
    });
  } catch (err) {
    console.error('ABC analysis error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate ABC analysis' 
    });
  }
});

// Location inventory summary
router.get('/location-summary', authMiddleware, (req, res) => {
  try {
    const db = new Database(dbPath);
    
    const summary = db.prepare(`
      SELECT 
        locations.id,
        locations.name,
        COUNT(DISTINCT inventory.product_id) as total_products,
        SUM(inventory.quantity) as total_units,
        SUM(inventory.quantity * products.cost) as total_cost_value,
        SUM(inventory.quantity * products.price) as total_retail_value
      FROM locations
      LEFT JOIN inventory ON locations.id = inventory.location_id
      LEFT JOIN products ON inventory.product_id = products.id
      GROUP BY locations.id
      ORDER BY locations.name
    `).all();

    db.close();

    res.json({
      success: true,
      report: summary
    });
  } catch (err) {
    console.error('Location summary error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate location summary' 
    });
  }
});

module.exports = router;