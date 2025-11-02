const API_URL = 'http://localhost:5000/api/auth';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

export const usersAPI = {
  // Get all users (admin only)
  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/users/all`, { headers: headers() });
    return response.json();
  },

  // Get users for specific location
  getUsersByLocation: async (locationId) => {
    const response = await fetch(`${API_URL}/users/location/${locationId}`, { headers: headers() });
    return response.json();
  },

  // Create new user
  createUser: async (data) => {
    const response = await fetch(`${API_URL}/users/create`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Update user
  updateUser: async (id, data) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: headers()
    });
    return response.json();
  }
};