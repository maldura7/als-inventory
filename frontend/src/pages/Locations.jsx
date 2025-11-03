import React, { useState, useEffect } from 'react';
import { locationsAPI } from '../services/api';
import '../styles/Table.css';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await locationsAPI.getAll(token);
      setLocations(data.data || []);
    } catch (err) {
      console.error('Error fetching locations:', err);
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
    const token = localStorage.getItem('token');
    const response = await locationsAPI.create(formData, token);
    console.log('✅ Success:', response);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: ''
    });
    setShowForm(false);
    fetchLocations();
    alert('Location created successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
    alert(`Error creating location: ${err.message}`);
  }
};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏬 Store Locations</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Location'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Add New Location</h3>
          
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Location Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
            />
            <input
              type="text"
              name="zip"
              placeholder="ZIP Code"
              value={formData.zip}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-success">Create Location</button>
        </form>
      )}

      {loading ? (
        <p>Loading locations...</p>
      ) : locations.length === 0 ? (
        <p className="empty-message">No locations yet. Create your first store!</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>City</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(loc => (
                <tr key={loc.id}>
                  <td>{loc.name}</td>
                  <td>{loc.address || '-'}</td>
                  <td>{loc.city || '-'}</td>
                  <td>{loc.phone || '-'}</td>
                  <td>{loc.email || '-'}</td>
                  <td>
                    <button className="btn-small btn-edit">Edit</button>
                    <button className="btn-small btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Locations;