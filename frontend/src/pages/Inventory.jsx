import React, { useState, useEffect } from 'react';
import { inventoryAPI, productsAPI, locationsAPI } from '../services/api';
import '../styles/Table.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    location_id: '',
    quantity: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [invData, prodData, locData] = await Promise.all([
        inventoryAPI.getAll(token),
        productsAPI.getAll(token),
        locationsAPI.getAll(token)
      ]);
      setInventory(invData.data || []);
      setProducts(prodData.data || []);
      setLocations(locData.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
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
      await inventoryAPI.adjust(formData, token);
      setFormData({
        product_id: '',
        location_id: '',
        quantity: ''
      });
      setShowForm(false);
      fetchData();
      alert('Inventory adjusted successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Error adjusting inventory');
    }
  };

  const getProductName = (id) => {
    const product = products.find(p => p.id === id);
    return product?.name || 'Unknown';
  };

  const getLocationName = (id) => {
    const location = locations.find(l => l.id === id);
    return location?.name || 'Unknown';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📈 Inventory Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Adjust Stock'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Adjust Stock</h3>
          
          <div className="form-row">
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            <select
              name="location_id"
              value={formData.location_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Location</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-success">Adjust Stock</button>
        </form>
      )}

      {loading ? (
        <p>Loading inventory...</p>
      ) : inventory.length === 0 ? (
        <p className="empty-message">No inventory items yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Reserved</th>
                <th>Available</th>
                <th>Last Counted</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td>{getProductName(item.product_id)}</td>
                  <td>{getLocationName(item.location_id)}</td>
                  <td>{item.quantity}</td>
                  <td>{item.reserved_quantity}</td>
                  <td className="available">{item.quantity - item.reserved_quantity}</td>
                  <td>{item.last_counted || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;