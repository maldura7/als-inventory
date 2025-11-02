import api from './api';

const cloverService = {
  getAuthUrl: async () => {
    const response = await api.get('/clover/auth-url');
    return response.data;
  },

  getMerchantInfo: async (sessionId) => {
    const response = await api.get('/clover/merchant-info', {
      params: { session_id: sessionId }
    });
    return response.data;
  },

  importProducts: async (sessionId, locationId) => {
    const response = await api.post('/clover/import-products', {
      session_id: sessionId,
      location_id: locationId
    });
    return response.data;
  },

  exportInventory: async (sessionId, locationId) => {
    const response = await api.post('/clover/export-inventory', {
      session_id: sessionId,
      location_id: locationId
    });
    return response.data;
  },

  manualSync: async (sessionId, direction, locationId) => {
    const response = await api.post('/clover/manual-sync', {
      session_id: sessionId,
      direction,
      location_id: locationId
    });
    return response.data;
  },

  getSyncStatus: async () => {
    const response = await api.get('/clover/sync-status');
    return response.data;
  },

  startAuthorization: async () => {
    const authResponse = await cloverService.getAuthUrl();
    if (authResponse.url) {
      window.location.href = authResponse.url;
    }
  }
};

export default cloverService;
