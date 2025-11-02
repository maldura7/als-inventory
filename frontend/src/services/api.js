const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Products API
export const productsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/products`, { headers: headers() });
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  },
  delete: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    return response.json();
  }
};

// Inventory API
export const inventoryAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/inventory`, { headers: headers() });
    return response.json();
  },
  adjust: async (data) => {
    const response = await fetch(`${API_URL}/inventory/adjust`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Locations API
export const locationsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/locations`, { headers: headers() });
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/locations`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  },
  update: async (id, data) => {
    const response = await fetch(`${API_URL}/locations/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Purchase Orders API
export const poAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/purchase-orders`, { headers: headers() });
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/purchase-orders`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Transfers API
export const transfersAPI = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/transfers`, { headers: headers() });
    return response.json();
  },
  create: async (data) => {
    const response = await fetch(`${API_URL}/transfers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

// Reports API
export const reportsAPI = {
  getInventoryReport: async () => {
    const response = await fetch(`${API_URL}/reports/inventory`, { headers: headers() });
    return response.json();
  },
  getSalesReport: async () => {
    const response = await fetch(`${API_URL}/reports/sales`, { headers: headers() });
    return response.json();
  }
};