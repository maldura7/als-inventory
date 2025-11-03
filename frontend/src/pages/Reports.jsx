import React, { useState } from 'react';
import '../styles/Table.css';

const Reports = () => {
  const [reportType, setReportType] = useState('inventory');

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
          onClick={() => setReportType('sales')}
          className={`report-btn ${reportType === 'sales' ? 'active' : ''}`}
        >
          💰 Sales Report
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
            <p>Loading inventory data...</p>
          </div>
        </div>
      )}

      {reportType === 'sales' && (
        <div className="report-content">
          <h3>💰 Sales Report</h3>
          <p>View sales analytics and trends</p>
          <div className="report-placeholder">
            <p>Loading sales data...</p>
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
              <p className="stat-number">0</p>
            </div>
            <div className="stat-box">
              <h4>Total Locations</h4>
              <p className="stat-number">0</p>
            </div>
            <div className="stat-box">
              <h4>Total Inventory Value</h4>
              <p className="stat-number">$0.00</p>
            </div>
            <div className="stat-box">
              <h4>Low Stock Items</h4>
              <p className="stat-number">0</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;