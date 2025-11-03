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

export const usersAPI = {
  getAllUsers: (token) => apiCall('GET', '/users', null, token),
  getUsersByLocation: (locationId, token) => apiCall('GET', `/users/location/${locationId}`, null, token),
  createUser: (data, token) => apiCall('POST', '/users/create', data, token),
  updateUser: (id, data, token) => apiCall('PUT', `/users/${id}`, data, token),
  deleteUser: (id, token) => apiCall('DELETE', `/users/${id}`, null, token),
};