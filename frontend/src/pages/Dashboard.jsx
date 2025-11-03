///import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [locationName, setLocationName] = useState('Loading...');
  const [stats, setStats] = useState({
    products: 0,
    inventory: 0,
    locations: 0,
    purchaseOrders: 0
  });
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, [fetchData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch user's location name
      if (user.location_id) {
        const locResponse = await fetch(`http://localhost:5000/api/locations/${user.location_id}`, { headers });
        const locData = await locResponse.json();
        if (locData.data) {
          setLocationName(locData.data.name);
        }
      }

      // Fetch products count
      const productsResponse = await fetch('http://localhost:5000/api/products', { headers });
      const productsData = await productsResponse.json();
      const productsCount = productsData.data ? productsData.data.length : 0;

      // Fetch inventory count
      const inventoryResponse = await fetch('http://localhost:5000/api/inventory', { headers });
      const inventoryData = await inventoryResponse.json();
      const totalInventory = inventoryData.data 
        ? inventoryData.data.reduce((sum, item) => sum + item.quantity, 0) 
        : 0;

      // Fetch locations
      const locationsResponse = await fetch('http://localhost:5000/api/locations', { headers });
      const locationsData = await locationsResponse.json();
      const locationsCount = locationsData.data ? locationsData.data.length : 0;

      // Fetch purchase orders
      const poResponse = await fetch('http://localhost:5000/api/purchase-orders', { headers });
      const poData = await poResponse.json();
      const poCount = poData.data ? poData.data.length : 0;

      setStats({
        products: productsCount,
        inventory: totalInventory,
        locations: locationsCount,
        purchaseOrders: poCount
      });
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>Al's Inventory</h1>
        </div>
        <div className="nav-user">
          <div className="user-info">
            <span className="user-name">{user.full_name}</span>
            <span className="user-location">{locationName}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="sidebar">
        <ul className="menu">
          <li className="menu-item active">
            <a href="/dashboard">📊 Dashboard</a>
          </li>
          <li className="menu-item">
            <a href="/products">📦 Products</a>
          </li>
          <li className="menu-item">
            <a href="/inventory">📈 Inventory</a>
          </li>
          <li className="menu-item">
            <a href="/locations">📍 Locations</a>
          </li>
          <li className="menu-item">
            <a href="/purchase-orders">🛒 Purchase Orders</a>
          </li>
          <li className="menu-item">
            <a href="/transfers">🚚 Transfers</a>
          </li>
          <li className="menu-item">
            <a href="/reports">📋 Reports</a>
          </li>
          <li className="menu-item">
            <a href="/users">👥 Users</a>
          </li>
        </ul>
      </div>

      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome, {user.full_name}!</h2>
          <p>📍 Store: <strong>{locationName}</strong></p>
          <p>Al's Inventory Management System</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Products</h3>
              <p className="stat-value">{loading ? '-' : stats.products}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>Total Inventory</h3>
              <p className="stat-value">{loading ? '-' : stats.inventory}</p>
              <p className="stat-unit">Units</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3>Your Location</h3>
              <p className="stat-value">{loading ? '-' : stats.locations}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-info">
              <h3>Purchase Orders</h3>
              <p className="stat-value">{loading ? '-' : stats.purchaseOrders}</p>
            </div>
          </div>
        </div>

        <div className="content-section">
          <h3>🎯 Quick Start Guide</h3>
          <p>You are viewing data for: <strong>{locationName}</strong></p>
          <p>Use the menu on the left to manage your store inventory:</p>
          <ul>
            <li><strong>📦 Products:</strong> Create and manage your product catalog with SKU, pricing, and categories</li>
            <li><strong>📈 Inventory:</strong> Track and adjust stock levels for this location</li>
            <li><strong>📍 Locations:</strong> View and manage store location details</li>
            <li><strong>🛒 Purchase Orders:</strong> Create and track orders from suppliers</li>
            <li><strong>🚚 Transfers:</strong> Transfer stock between locations</li>
            <li><strong>📋 Reports:</strong> View detailed analytics and business reports</li>
            <li><strong>👥 Users:</strong> Manage team members and permissions (Admin only)</li>
          </ul>

          <div className="info-box">
            <h4>✨ Store-Specific Access</h4>
            <p>You can only see data for <strong>{locationName}</strong>. All products, inventory, and orders shown are specific to your store location.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;