import api from './api';

const transferService = {
  getAll: async (page = 1, limit = 20, filters = {}) => {
    const response = await api.get('/transfers', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/transfers/${id}`);
    return response.data;
  },

  create: async (transferData) => {
    const response = await api.post('/transfers', transferData);
    return response.data;
  },

  receive: async (id, items) => {
    const response = await api.post(`/transfers/${id}/receive`, { items });
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/transfers/${id}/status`, { status });
    return response.data;
  }
};

export default transferService;
