const express = require('express');
const router = express.Router();
const { db } = require('../database/init-database');
const { authMiddleware } = require('../middleware/auth');

// Inventory valuation report
router.get('/inventory-value', authMiddleware, (req, res) => {
  try {
    const { location_id, category } = req.query;

    let whereClause = 'products.is_active = 1';
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
      AND products.is_active = 1
    `;

    let params = [];

    if (location_id) {
      query += ' AND inventory.location_id = ?';
      params.push(location_id);
    }

    query += ' ORDER BY shortage DESC';

    const report = db.prepare(query).all(...params);

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

// Stock movements report
router.get('/stock-movements', authMiddleware, (req, res) => {
  try {
    const { location_id, product_id, movement_type, start_date, end_date } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    let whereClause = '1=1';
    const params = [];

    if (location_id) {
      whereClause += ' AND stock_movements.location_id = ?';
      params.push(location_id);
    }

    if (product_id) {
      whereClause += ' AND stock_movements.product_id = ?';
      params.push(product_id);
    }

    if (movement_type) {
      whereClause += ' AND stock_movements.movement_type = ?';
      params.push(movement_type);
    }

    if (start_date) {
      whereClause += ' AND stock_movements.created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND stock_movements.created_at <= ?';
      params.push(end_date);
    }

    const movements = db.prepare(`
      SELECT 
        stock_movements.*,
        products.sku,
        products.name,
        locations.name as location_name,
        users.full_name as user_name
      FROM stock_movements
      JOIN products ON stock_movements.product_id = products.id
      JOIN locations ON stock_movements.location_id = locations.id
      LEFT JOIN users ON stock_movements.user_id = users.id
      WHERE ${whereClause}
      ORDER BY stock_movements.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM stock_movements
      WHERE ${whereClause}
    `).get(...params).count;

    res.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Stock movements report error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate stock movements report' 
    });
  }
});

// ABC Analysis report
router.get('/abc-analysis', authMiddleware, (req, res) => {
  try {
    const { location_id } = req.query;

    let whereClause = 'products.is_active = 1';
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

    // Calculate total value
    const totalValue = allItems.reduce((sum, item) => sum + item.item_value, 0);

    // Classify items into A, B, C
    let cumulativeValue = 0;
    const report = allItems.map(item => {
      cumulativeValue += item.item_value;
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

// Stock turnover report
router.get('/turnover', authMiddleware, (req, res) => {
  try {
    const { location_id, days = 90 } = req.query;

    let whereClause = 'products.is_active = 1';
    let dateClause = `stock_movements.created_at >= datetime('now', '-${days} days')`;
    const params = [];

    if (location_id) {
      whereClause += ' AND inventory.location_id = ?';
      params.push(location_id);
    }

    const report = db.prepare(`
      SELECT 
        products.id,
        products.sku,
        products.name,
        products.category,
        SUM(CASE WHEN stock_movements.movement_type IN ('sale', 'transfer') AND stock_movements.quantity < 0 
                 THEN ABS(stock_movements.quantity) ELSE 0 END) as quantity_sold,
        AVG(inventory.quantity) as avg_quantity,
        CASE 
          WHEN AVG(inventory.quantity) > 0 
          THEN ROUND(SUM(CASE WHEN stock_movements.movement_type IN ('sale', 'transfer') AND stock_movements.quantity < 0 
                         THEN ABS(stock_movements.quantity) ELSE 0 END) / AVG(inventory.quantity), 2)
          ELSE 0 
        END as turnover_ratio
      FROM inventory
      JOIN products ON inventory.product_id = products.id
      LEFT JOIN stock_movements ON products.id = stock_movements.product_id 
        AND ${dateClause}
      WHERE ${whereClause}
      GROUP BY products.id
      ORDER BY turnover_ratio DESC
    `).all(...params);

    res.json({
      success: true,
      report,
      period_days: parseInt(days)
    });
  } catch (err) {
    console.error('Turnover report error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate turnover report' 
    });
  }
});

// Location inventory summary
router.get('/location-summary', authMiddleware, (req, res) => {
  try {
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
      WHERE locations.is_active = 1
      GROUP BY locations.id
      ORDER BY locations.name
    `).all();

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
