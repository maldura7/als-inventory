import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/userService';
import { locationsAPI } from '../services/api';
import '../styles/Table.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'staff',
    location_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Only admins can view all users
      if (currentUser.role === 'admin') {
        const [usersData, locationsData] = await Promise.all([
          usersAPI.getAllUsers(),
          locationsAPI.getAll()
        ]);
        setUsers(usersData.data || []);
        setLocations(locationsData.data || []);
      } else {
        // Non-admins can only view users in their location
        const usersData = await usersAPI.getUsersByLocation(currentUser.location_id);
        const locationsData = await locationsAPI.getAll();
        setUsers(usersData.data || []);
        setLocations(locationsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update user
        const updateData = {
          full_name: formData.full_name,
          role: formData.role,
          location_id: formData.location_id,
          is_active: 1
        };
        await usersAPI.updateUser(editingId, updateData);
        alert('User updated successfully!');
      } else {
        // Create new user
        if (!formData.password) {
          alert('Password is required for new users');
          return;
        }
        await usersAPI.createUser(formData);
        alert('User created successfully!');
      }
      
      resetForm();
      fetchData();
    } catch (err) {
      alert('Error saving user');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'staff',
      location_id: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (user) => {
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      location_id: user.location_id
    });
    setEditingId(user.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(id);
        alert('User deleted successfully!');
        fetchData();
      } catch (err) {
        alert('Error deleting user');
      }
    }
  };

  const getLocationName = (id) => {
    const location = locations.find(l => l.id === id);
    return location?.name || 'Unknown';
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': '#e74c3c',
      'manager': '#f39c12',
      'staff': '#3498db'
    };
    return colors[role] || '#95a5a6';
  };

  // Only admins can access this page
  if (currentUser.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="error-message" style={{ marginTop: '50px' }}>
          ⛔ Only administrators can manage users
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 User Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>{editingId ? 'Edit User' : 'Create New User'}</h3>
          
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              disabled={!!editingId}
              required
            />
            {!editingId && (
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <div className="form-row">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-row">
            <select
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-success">
            {editingId ? 'Update User' : 'Create User'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p className="empty-message">No users yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><strong>{user.full_name}</strong></td>
                  <td>{user.email}</td>
                  <td>
                    <span 
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        backgroundColor: getRoleColor(user.role),
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{getLocationName(user.location_id)}</td>
                  <td>
                    <span style={{ color: user.is_active ? '#27ae60' : '#e74c3c' }}>
                      {user.is_active ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(user)}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="btn-small btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="content-section" style={{ marginTop: '30px' }}>
        <h3>👥 User Roles Explained</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#ffe8e8', borderRadius: '6px' }}>
            <h4 style={{ marginTop: 0, color: '#e74c3c' }}>🔴 Admin</h4>
            <p>Full access to all features. Can manage users and settings. View all locations and data.</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#fff4e8', borderRadius: '6px' }}>
            <h4 style={{ marginTop: 0, color: '#f39c12' }}>🟠 Manager</h4>
            <p>Can manage inventory and orders. Limited to their assigned location. Can create staff accounts.</p>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#e8f4ff', borderRadius: '6px' }}>
            <h4 style={{ marginTop: 0, color: '#3498db' }}>🔵 Staff</h4>
            <p>Can view and adjust inventory. Cannot create users or access settings. Limited to their location.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;