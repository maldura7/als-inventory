import api from './api';

const inventoryService = {
  getAll: async (page = 1, limit = 20, filters = {}) => {
    const response = await api.get('/inventory', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  getByProduct: async (productId) => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  adjustStock: async (productId, locationId, quantity, reason = null) => {
    const response = await api.post('/inventory/adjust', {
      product_id: productId,
      location_id: locationId,
      quantity,
      reason
    });
    return response.data;
  },

  getLowStockReport: async (locationId = null) => {
    const response = await api.get('/inventory/report/low-stock', {
      params: { location_id: locationId }
    });
    return response.data;
  },

  getStockMovements: async (page = 1, limit = 50, filters = {}) => {
    const response = await api.get('/inventory/movements/history', {
      params: { page, limit, ...filters }
    });
    return response.data;
  }
};

export default inventoryService;
