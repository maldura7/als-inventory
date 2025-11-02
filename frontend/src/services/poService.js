import api from './api';

const poService = {
  getAll: async (page = 1, limit = 20, filters = {}) => {
    const response = await api.get('/purchase-orders', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  create: async (poData) => {
    const response = await api.post('/purchase-orders', poData);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/purchase-orders/${id}/status`, { status });
    return response.data;
  },

  receive: async (id, items) => {
    const response = await api.post(`/purchase-orders/${id}/receive`, { items });
    return response.data;
  },

  getByStatus: async (status) => {
    const response = await api.get('/purchase-orders', {
      params: { status }
    });
    return response.data;
  }
};

export default poService;
