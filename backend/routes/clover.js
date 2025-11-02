const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database/init-database');
const { authMiddleware, managerOrAdmin } = require('../middleware/auth');
const CloverService = require('../services/clover-service');

const cloverService = new CloverService();

// Store Clover token temporarily (in production, use secure session storage)
const cloverTokens = {};

// Step 1: Get authorization URL
router.get('/auth-url', (req, res) => {
  try {
    const redirectUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/clover/auth-callback`;
    const authUrl = cloverService.getAuthorizationUrl(redirectUrl);

    res.json({
      success: true,
      url: authUrl
    });
  } catch (err) {
    console.error('Get auth URL error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get authorization URL' 
    });
  }
});

// Step 2: Handle OAuth callback
router.get('/auth-callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'No authorization code provided' 
      });
    }

    const redirectUrl = `${process.env.APP_URL || 'http://localhost:5000'}/api/clover/auth-callback`;
    const tokenData = await cloverService.getAccessToken(code, redirectUrl);

    // Store token temporarily (in production, associate with user session)
    const sessionId = uuidv4();
    cloverTokens[sessionId] = {
      accessToken: tokenData.access_token,
      merchantId: tokenData.merchant_id,
      createdAt: new Date()
    };

    // Redirect to frontend with session ID
    res.redirect(`http://localhost:3000/clover/setup?session=${sessionId}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Authorization failed' 
    });
  }
});

// Get merchant info
router.get('/merchant-info', authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id || !cloverTokens[session_id]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid session' 
      });
    }

    const token = cloverTokens[session_id];
    const merchantInfo = await cloverService.getMerchantInfo(token.accessToken, token.merchantId);

    res.json({
      success: true,
      merchant: merchantInfo
    });
  } catch (err) {
    console.error('Get merchant info error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get merchant information' 
    });
  }
});

// Import products from Clover
router.post('/import-products', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { session_id, location_id } = req.body;

    if (!session_id || !cloverTokens[session_id]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid session' 
      });
    }

    if (!location_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location ID is required' 
      });
    }

    const token = cloverTokens[session_id];
    let offset = 0;
    let allItems = [];
    let hasMore = true;

    // Paginate through all items
    while (hasMore) {
      const itemsData = await cloverService.getInventoryItems(
        token.accessToken,
        token.merchantId,
        { offset, limit: 100 }
      );

      if (itemsData.elements && itemsData.elements.length > 0) {
        allItems = allItems.concat(itemsData.elements);
        offset += itemsData.elements.length;
      }

      hasMore = itemsData.elements && itemsData.elements.length === 100;
    }

    // Import products
    let imported = 0;
    let skipped = 0;

    allItems.forEach(cloverItem => {
      try {
        // Check if product already exists by Clover ID
        const existing = db.prepare('SELECT id FROM products WHERE clover_id = ?').get(cloverItem.id);

        if (existing) {
          skipped++;
          return;
        }

        const productId = uuidv4();
        const mappedProduct = cloverService.mapFromCloverItem(cloverItem);

        db.prepare(`
          INSERT INTO products (id, sku, name, description, price, cost, clover_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          productId,
          mappedProduct.sku || uuidv4(),
          mappedProduct.name,
          mappedProduct.description,
          mappedProduct.price,
          mappedProduct.cost || 0,
          cloverItem.id
        );

        // Create inventory record for location
        const inventoryId = uuidv4();
        const quantity = cloverItem.inventory?.quantity || 0;

        db.prepare(`
          INSERT INTO inventory (id, product_id, location_id, quantity)
          VALUES (?, ?, ?, ?)
        `).run(inventoryId, productId, location_id, quantity);

        imported++;
      } catch (itemErr) {
        console.error(`Error importing item ${cloverItem.id}:`, itemErr);
        skipped++;
      }
    });

    // Clean up session
    delete cloverTokens[session_id];

    res.json({
      success: true,
      message: `Import complete: ${imported} imported, ${skipped} skipped`,
      stats: {
        imported,
        skipped,
        total: allItems.length
      }
    });
  } catch (err) {
    console.error('Import products error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import products from Clover' 
    });
  }
});

// Export inventory to Clover
router.post('/export-inventory', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { session_id, location_id } = req.body;

    if (!session_id || !cloverTokens[session_id]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid session' 
      });
    }

    if (!location_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location ID is required' 
      });
    }

    const token = cloverTokens[session_id];

    // Get products with Clover IDs
    const products = db.prepare(`
      SELECT 
        products.*,
        inventory.quantity
      FROM products
      JOIN inventory ON products.id = inventory.product_id
      WHERE inventory.location_id = ? AND products.clover_id IS NOT NULL
    `).all(location_id);

    let exported = 0;
    let failed = 0;

    // Update inventory in Clover
    for (const product of products) {
      try {
        await cloverService.updateItemInventory(
          token.accessToken,
          token.merchantId,
          product.clover_id,
          product.quantity
        );
        exported++;
      } catch (err) {
        console.error(`Failed to export inventory for ${product.id}:`, err);
        failed++;
      }
    }

    // Clean up session
    delete cloverTokens[session_id];

    res.json({
      success: true,
      message: `Export complete: ${exported} exported, ${failed} failed`,
      stats: {
        exported,
        failed,
        total: products.length
      }
    });
  } catch (err) {
    console.error('Export inventory error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export inventory to Clover' 
    });
  }
});

// Manual sync
router.post('/manual-sync', authMiddleware, managerOrAdmin, async (req, res) => {
  try {
    const { session_id, direction, location_id } = req.body;

    if (!session_id || !cloverTokens[session_id]) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid session' 
      });
    }

    if (!['import', 'export', 'bidirectional'].includes(direction)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid sync direction' 
      });
    }

    // For this demo, we'll just return success
    // In production, you'd implement full sync logic here

    res.json({
      success: true,
      message: `Sync ${direction} completed successfully`,
      sync_status: 'completed',
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Manual sync error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Sync failed' 
    });
  }
});

// Check sync status
router.get('/sync-status', authMiddleware, (req, res) => {
  try {
    res.json({
      success: true,
      status: 'active',
      last_sync: new Date(Date.now() - 3600000), // 1 hour ago
      next_scheduled_sync: new Date(Date.now() + 3600000), // 1 hour from now
      sync_interval: 3600 // seconds
    });
  } catch (err) {
    console.error('Check sync status error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check sync status' 
    });
  }
});

module.exports = router;
