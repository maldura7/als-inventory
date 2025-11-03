const API_URL = '/api';

// Generic API helper
const apiCall = async (method, endpoint, data = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (data) options.body = JSON.stringify(data);
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
};

// Export generic API
export const api = {
  get: (endpoint, token) => apiCall('GET', endpoint, null, token),
  post: (endpoint, data, token) => apiCall('POST', endpoint, data, token),
  put: (endpoint, data, token) => apiCall('PUT', endpoint, data, token),
  delete: (endpoint, token) => apiCall('DELETE', endpoint, null, token),
};

// Inventory API
export const inventoryAPI = {
  getAll: (token) => apiCall('GET', '/inventory', null, token),
  getByProduct: (productId, token) => apiCall('GET', `/inventory/product/${productId}`, null, token),
  adjust: (data, token) => apiCall('POST', '/inventory/adjust', data, token),
  getLowStock: (token) => apiCall('GET', '/inventory/report/low-stock', null, token),
  getHistory: (token) => apiCall('GET', '/inventory/movements/history', null, token),
};

// Products API
export const productsAPI = {
  getAll: (token) => apiCall('GET', '/products', null, token),
  getById: (id, token) => apiCall('GET', `/products/${id}`, null, token),
  create: (data, token) => apiCall('POST', '/products', data, token),
  update: (id, data, token) => apiCall('PUT', `/products/${id}`, data, token),
  delete: (id, token) => apiCall('DELETE', `/products/${id}`, null, token),
};

// Locations API
export const locationsAPI = {
  getAll: (token) => apiCall('GET', '/locations', null, token),
  getById: (id, token) => apiCall('GET', `/locations/${id}`, null, token),
  create: (data, token) => apiCall('POST', '/locations', data, token),
  update: (id, data, token) => apiCall('PUT', `/locations/${id}`, data, token),
  delete: (id, token) => apiCall('DELETE', `/locations/${id}`, null, token),
};

// Purchase Orders API
export const poAPI = {
  getAll: (token) => apiCall('GET', '/purchase-orders', null, token),
  getById: (id, token) => apiCall('GET', `/purchase-orders/${id}`, null, token),
  create: (data, token) => apiCall('POST', '/purchase-orders', data, token),
  updateStatus: (id, status, token) => apiCall('PUT', `/purchase-orders/${id}/status`, { status }, token),
  receive: (id, data, token) => apiCall('POST', `/purchase-orders/${id}/receive`, data, token),
};

// Suppliers API
export const suppliersAPI = {
  getAll: (token) => apiCall('GET', '/suppliers', null, token),
  getById: (id, token) => apiCall('GET', `/suppliers/${id}`, null, token),
  create: (data, token) => apiCall('POST', '/suppliers', data, token),
  update: (id, data, token) => apiCall('PUT', `/suppliers/${id}`, data, token),
  delete: (id, token) => apiCall('DELETE', `/suppliers/${id}`, null, token),
};

// Transfers API
export const transfersAPI = {
  getAll: (token) => apiCall('GET', '/transfers', null, token),
  getById: (id, token) => apiCall('GET', `/transfers/${id}`, null, token),
  create: (data, token) => apiCall('POST', '/transfers', data, token),
  updateStatus: (id, status, token) => apiCall('PUT', `/transfers/${id}/status`, { status }, token),
  receive: (id, data, token) => apiCall('POST', `/transfers/${id}/receive`, data, token),
};

// Reports API
export const reportsAPI = {
  getInventoryValue: (token) => apiCall('GET', '/reports/inventory-value', null, token),
  getLowStock: (token) => apiCall('GET', '/reports/low-stock', null, token),
  getMovements: (token) => apiCall('GET', '/reports/stock-movements', null, token),
  getABC: (token) => apiCall('GET', '/reports/abc-analysis', null, token),
  getTurnover: (token) => apiCall('GET', '/reports/turnover', null, token),
  getLocationSummary: (token) => apiCall('GET', '/reports/location-summary', null, token),
};

// Users API
export const usersAPI = {
  getAllUsers: (token) => apiCall('GET', '/users', null, token),
  getUsersByLocation: (locationId, token) => apiCall('GET', `/users/location/${locationId}`, null, token),
  createUser: (data, token) => apiCall('POST', '/users', data, token),
  updateUser: (id, data, token) => apiCall('PUT', `/users/${id}`, data, token),
  deleteUser: (id, token) => apiCall('DELETE', `/users/${id}`, null, token),
};