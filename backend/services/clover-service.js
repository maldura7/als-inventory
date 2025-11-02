const axios = require('axios');

class CloverService {
  constructor() {
    this.appId = process.env.CLOVER_APP_ID;
    this.appSecret = process.env.CLOVER_APP_SECRET;
    this.sandboxUrl = process.env.CLOVER_SANDBOX_URL || 'https://sandbox.clover.com';
    this.productionUrl = process.env.CLOVER_API_URL || 'https://api.clover.com';
    this.environment = process.env.CLOVER_ENVIRONMENT || 'sandbox';
    this.baseUrl = this.environment === 'sandbox' ? this.sandboxUrl : this.productionUrl;
  }

  // Generate OAuth authorization URL
  getAuthorizationUrl(redirectUrl) {
    return `${this.baseUrl}/oauth/authorize?` +
      `client_id=${this.appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUrl)}&` +
      `response_type=code`;
  }

  // Exchange authorization code for access token
  async getAccessToken(code, redirectUrl) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/oauth/token`,
        {
          client_id: this.appId,
          client_secret: this.appSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error('Clover OAuth error:', err);
      throw new Error('Failed to get access token');
    }
  }

  // Get merchant info
  async getMerchantInfo(accessToken, merchantId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get merchant error:', err);
      throw new Error('Failed to get merchant information');
    }
  }

  // Get inventory items from Clover
  async getInventoryItems(accessToken, merchantId, params = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}/items`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            limit: params.limit || 100,
            offset: params.offset || 0,
            ...params
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get inventory items error:', err);
      throw new Error('Failed to get inventory items from Clover');
    }
  }

  // Get single item from Clover
  async getItem(accessToken, merchantId, itemId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}/items/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get item error:', err);
      throw new Error('Failed to get item from Clover');
    }
  }

  // Create item in Clover
  async createItem(accessToken, merchantId, itemData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v3/merchants/${merchantId}/items`,
        itemData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Create item error:', err);
      throw new Error('Failed to create item in Clover');
    }
  }

  // Update item in Clover
  async updateItem(accessToken, merchantId, itemId, itemData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v3/merchants/${merchantId}/items/${itemId}`,
        itemData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Update item error:', err);
      throw new Error('Failed to update item in Clover');
    }
  }

  // Get item inventory in Clover
  async getItemInventory(accessToken, merchantId, itemId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}/items/${itemId}/inventory`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get item inventory error:', err);
      throw new Error('Failed to get item inventory from Clover');
    }
  }

  // Update item inventory in Clover
  async updateItemInventory(accessToken, merchantId, itemId, quantity) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v3/merchants/${merchantId}/items/${itemId}/inventory`,
        { quantity },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Update item inventory error:', err);
      throw new Error('Failed to update item inventory in Clover');
    }
  }

  // Get modifiers (for item variants)
  async getModifiers(accessToken, merchantId, itemId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}/items/${itemId}/modifiers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get modifiers error:', err);
      throw new Error('Failed to get modifiers');
    }
  }

  // Get categories
  async getCategories(accessToken, merchantId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}/categories`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          params: {
            limit: 100
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get categories error:', err);
      throw new Error('Failed to get categories');
    }
  }

  // Get employees (for audit tracking)
  async getEmployees(accessToken, merchantId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v3/merchants/${merchantId}/employees`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      return response.data;
    } catch (err) {
      console.error('Get employees error:', err);
      throw new Error('Failed to get employees');
    }
  }

  // Map local inventory to Clover format
  mapToCloverItem(localProduct) {
    return {
      name: localProduct.name,
      code: localProduct.sku,
      sku: localProduct.sku,
      price: (localProduct.price * 100), // Clover uses cents
      cost: (localProduct.cost * 100),
      description: localProduct.description || '',
      notes: localProduct.notes || ''
    };
  }

  // Map Clover item to local format
  mapFromCloverItem(cloverItem) {
    return {
      name: cloverItem.name,
      sku: cloverItem.code || cloverItem.sku,
      price: (cloverItem.price / 100), // Convert from cents
      cost: (cloverItem.cost / 100),
      description: cloverItem.description || '',
      clover_id: cloverItem.id
    };
  }
}

module.exports = CloverService;
