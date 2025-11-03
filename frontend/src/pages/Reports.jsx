import React, { useState, useEffect } from 'react';
import { productsAPI, locationsAPI, inventoryAPI } from '../services/api';
import '../styles/Table.css';

const Reports = () => {
  const [reportType, setReportType] = useState('summary');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalLocations: 0,
    totalValue: 0,
    lowStockItems: 0,
    inventory: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [productsData, locationsData, inventoryData] = await Promise.all([
        productsAPI.getAll(token),
        locationsAPI.getAll(token),
        inventoryAPI.getAll(token)
      ]);

      const products = productsData.data || [];
      const locations = locationsData.data || [];
      const inventory = inventoryData.data || [];

      // Calculate stats
      const totalProducts = products.length;
      const totalLocations = locations.length;
      const totalValue = products.reduce((sum, p) => sum + ((p.price || 0) * getProductInventory(p.id, inventory)), 0);
      const lowStockItems = products.filter(p => {
        const invItem = inventory.find(i => i.product_id === p.id);
        return invItem && invItem.quantity < (p.reorder_point || 10);
      }).length;

      setStats({
        totalProducts,
        totalLocations,
        totalValue,
        lowStockItems,
        inventory
      });
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductInventory = (productId, inventory) => {
    return inventory
      .filter(i => i.product_id === productId)
      .reduce((sum, i) => sum + (i.quantity || 0), 0);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📋 Reports & Analytics</h1>
      </div>

      <div className="report-selector">
        <button 
          onClick={() => setReportType('inventory')}
          className={`report-btn ${reportType === 'inventory' ? 'active' : ''}`}
        >
          📦 Inventory Report
        </button>
        <button 
          onClick={() => setReportType('summary')}
          className={`report-btn ${reportType === 'summary' ? 'active' : ''}`}
        >
          📊 Summary
        </button>
      </div>

      {reportType === 'inventory' && (
        <div className="report-content">
          <h3>📦 Inventory Report</h3>
          <p>View current stock levels across all locations</p>
          <div className="report-placeholder">
            {loading ? (
              <p>Loading inventory data...</p>
            ) : stats.inventory.length === 0 ? (
              <p>No inventory data available</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.inventory.map(item => (
                      <tr key={item.id}>
                        <td>{item.location_id}</td>
                        <td>{item.product_id}</td>
                        <td>{item.quantity}</td>
                        <td>
                          {item.quantity > 20 ? '✅ Good' : item.quantity > 10 ? '⚠️ Medium' : '🔴 Low'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {reportType === 'summary' && (
        <div className="report-content">
          <h3>📊 Business Summary</h3>
          <p>Overview of your business metrics</p>
          <div className="stats-container">
            <div className="stat-box">
              <h4>Total Products</h4>
              <p className="stat-number">{loading ? '-' : stats.totalProducts}</p>
            </div>
            <div className="stat-box">
              <h4>Total Locations</h4>
              <p className="stat-number">{loading ? '-' : stats.totalLocations}</p>
            </div>
            <div className="stat-box">
              <h4>Total Inventory Value</h4>
              <p className="stat-number">${loading ? '0.00' : stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="stat-box">
              <h4>Low Stock Items</h4>
              <p className="stat-number">{loading ? '-' : stats.lowStockItems}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;