import api from './api';

const reportService = {
  getInventoryValue: async (filters = {}) => {
    const response = await api.get('/reports/inventory-value', {
      params: filters
    });
    return response.data;
  },

  getLowStock: async (locationId = null) => {
    const response = await api.get('/reports/low-stock', {
      params: { location_id: locationId }
    });
    return response.data;
  },

  getStockMovements: async (page = 1, limit = 50, filters = {}) => {
    const response = await api.get('/reports/stock-movements', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  getABCAnalysis: async (locationId = null) => {
    const response = await api.get('/reports/abc-analysis', {
      params: { location_id: locationId }
    });
    return response.data;
  },

  getTurnover: async (locationId = null, days = 90) => {
    const response = await api.get('/reports/turnover', {
      params: { location_id: locationId, days }
    });
    return response.data;
  },

  getLocationSummary: async () => {
    const response = await api.get('/reports/location-summary');
    return response.data;
  }
};

export default reportService;
