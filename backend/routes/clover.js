const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const CloverService = require('../services/cloverService');
const authMiddleware = require('../middleware/auth');

const dbPath = path.join(__dirname, '../database/inventory.db');

// Initialize Clover service
const cloverService = new CloverService();

// GET /api/clover/authorize - Start OAuth flow
router.get('/authorize', (req, res) => {
  try {
    const redirectUri = process.env.CLOVER_REDIRECT_URI || 
      'http://localhost:5000/api/clover/oauth-callback';
    
    const authUrl = cloverService.getAuthorizationUrl(redirectUri);
    console.log('🔗 Redirecting to Clover OAuth:', authUrl);
    res.redirect(authUrl);
  } catch (err) {
    console.error('❌ Authorization error:', err);
    res.status(500).json({ success: false, message: 'Authorization failed' });
  }
});

// GET /api/clover/oauth-callback - Handle OAuth callback
router.get('/oauth-callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: `OAuth error: ${error}` 
      });
    }

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'No authorization code received' 
      });
    }

    const redirectUri = process.env.CLOVER_REDIRECT_URI || 
      'http://localhost:5000/api/clover/oauth-callback';

    // Exchange code for access token
    const tokenData = await cloverService.getAccessToken(code, redirectUri);
    const { access_token, merchant_id } = tokenData;

    // Store Clover connection in database
    const db = new Database(dbPath);
    const userId = req.query.user_id;

    if (userId) {
      db.prepare(`
        UPDATE users 
        SET clover_merchant_id = ?, clover_access_token = ?, clover_connected_at = ?
        WHERE id = ?
      `).run(merchant_id, access_token, new Date().toISOString(), userId);

      console.log('✅ Clover account connected for user:', userId);
    }

    db.close();

    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?clover=connected`);

  } catch (err) {
    console.error('❌ OAuth callback error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process OAuth callback' 
    });
  }
});

// POST /api/clover/connect - Get authorization URL
router.post('/connect', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const redirectUri = process.env.CLOVER_REDIRECT_URI || 
      'http://localhost:5000/api/clover/oauth-callback';
    
    const authUrl = cloverService.getAuthorizationUrl(redirectUri) + `&user_id=${userId}`;

    res.json({
      success: true,
      message: 'Authorization URL generated',
      authUrl: authUrl
    });

  } catch (err) {
    console.error('❌ Connect error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate authorization URL' 
    });
  }
});

// GET /api/clover/status - Check connection status
router.get('/status', authMiddleware, (req, res) => {
  try {
    const db = new Database(dbPath);
    const user = db.prepare(
      'SELECT clover_merchant_id, clover_access_token, clover_connected_at FROM users WHERE id = ?'
    ).get(req.user.id);
    db.close();

    if (user && user.clover_merchant_id && user.clover_access_token) {
      res.json({
        success: true,
        connected: true,
        merchantId: user.clover_merchant_id,
        connectedAt: user.clover_connected_at
      });
    } else {
      res.json({
        success: true,
        connected: false
      });
    }
  } catch (err) {
    console.error('❌ Status error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check Clover status' 
    });
  }
});

// POST /api/clover/sync-products - Sync products to Clover
router.post('/sync-products', authMiddleware, async (req, res) => {
  try {
    const db = new Database(dbPath);
    const user = db.prepare(
      'SELECT clover_merchant_id, clover_access_token FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user || !user.clover_access_token || !user.clover_merchant_id) {
      db.close();
      return res.status(400).json({ 
        success: false, 
        message: 'Clover account not connected' 
      });
    }

    const products = db.prepare('SELECT * FROM products').all();
    const syncResults = [];

    for (const product of products) {
      try {
        const cloverProduct = cloverService.mapToCloverItem(product);
        
        let result;
        if (product.clover_id) {
          // Update existing
          result = await cloverService.updateItem(
            user.clover_access_token,
            user.clover_merchant_id,
            product.clover_id,
            cloverProduct
          );
          console.log('📤 Updated product in Clover:', product.name);
        } else {
          // Create new
          result = await cloverService.createItem(
            user.clover_access_token,
            user.clover_merchant_id,
            cloverProduct
          );
          console.log('📤 Created product in Clover:', product.name);
          
          // Store Clover ID
          db.prepare('UPDATE products SET clover_id = ? WHERE id = ?')
            .run(result.id, product.id);
        }

        syncResults.push({
          productId: product.id,
          name: product.name,
          clover_id: result.id,
          status: 'success'
        });
      } catch (err) {
        syncResults.push({
          productId: product.id,
          name: product.name,
          status: 'failed',
          error: err.message
        });
      }
    }

    db.close();

    res.json({
      success: true,
      message: `Synced ${syncResults.filter(r => r.status === 'success').length}/${products.length} products`,
      results: syncResults
    });

  } catch (err) {
    console.error('❌ Sync products error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync products' 
    });
  }
});

// POST /api/clover/sync-inventory - Sync inventory to Clover
router.post('/sync-inventory', authMiddleware, async (req, res) => {
  try {
    const db = new Database(dbPath);
    const user = db.prepare(
      'SELECT clover_merchant_id, clover_access_token FROM users WHERE id = ?'
    ).get(req.user.id);

    if (!user || !user.clover_access_token || !user.clover_merchant_id) {
      db.close();
      return res.status(400).json({ 
        success: false, 
        message: 'Clover account not connected' 
      });
    }

    const inventory = db.prepare(`
      SELECT i.*, p.clover_id, p.name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE p.clover_id IS NOT NULL
    `).all();

    const syncResults = [];
    for (const item of inventory) {
      try {
        await cloverService.updateItemInventory(
          user.clover_access_token,
          user.clover_merchant_id,
          item.clover_id,
          item.quantity
        );
        
        console.log('📊 Synced inventory:', item.name, 'qty:', item.quantity);
        syncResults.push({
          inventoryId: item.id,
          name: item.name,
          quantity: item.quantity,
          status: 'success'
        });
      } catch (err) {
        syncResults.push({
          inventoryId: item.id,
          name: item.name,
          status: 'failed',
          error: err.message
        });
      }
    }

    db.close();

    res.json({
      success: true,
      message: `Synced ${syncResults.filter(r => r.status === 'success').length}/${inventory.length} inventory items`,
      results: syncResults
    });

  } catch (err) {
    console.error('❌ Sync inventory error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to sync inventory' 
    });
  }
});

// POST /api/clover/disconnect - Disconnect Clover
router.post('/disconnect', authMiddleware, (req, res) => {
  try {
    const db = new Database(dbPath);
    db.prepare(`
      UPDATE users 
      SET clover_merchant_id = NULL, clover_access_token = NULL, clover_connected_at = NULL
      WHERE id = ?
    `).run(req.user.id);
    db.close();

    res.json({
      success: true,
      message: 'Clover account disconnected'
    });

  } catch (err) {
    console.error('❌ Disconnect error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disconnect Clover account' 
    });
  }
});

module.exports = router;