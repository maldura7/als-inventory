import api from './api';

const productService = {
  getAll: async (page = 1, limit = 20, filters = {}) => {
    const response = await api.get('/products', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/products/categories/all');
    return response.data;
  },

  search: async (query, page = 1, limit = 20) => {
    const response = await api.get('/products', {
      params: { page, limit, search: query }
    });
    return response.data;
  },

  searchBySku: async (sku, page = 1, limit = 20) => {
    const response = await api.get('/products', {
      params: { page, limit, sku }
    });
    return response.data;
  }
};

export default productService;
