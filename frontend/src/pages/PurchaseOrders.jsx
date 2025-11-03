import React, { useState, useEffect } from 'react';
import { poAPI } from '../services/api';
import '../styles/Table.css';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    po_number: '',
    supplier_id: '',
    location_id: '',
    expected_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await poAPI.getAll();
      setOrders(data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
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
    const response = await poAPI.create(formData, token);
    console.log('✅ Success:', response);
    setFormData({
      po_number: '',
      supplier_id: '',
      location_id: '',
      expected_date: '',
      notes: ''
    });
    setShowForm(false);
    fetchOrders();
    alert('Purchase order created successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
    alert(`Error creating purchase order: ${err.message}`);
  }
};

  const getStatusColor = (status) => {
    const colors = {
      'draft': '#95a5a6',
      'sent': '#3498db',
      'received': '#27ae60',
      'cancelled': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛒 Purchase Orders</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New PO'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Create Purchase Order</h3>
          
          <div className="form-row">
            <input
              type="text"
              name="po_number"
              placeholder="PO Number"
              value={formData.po_number}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="supplier_id"
              placeholder="Supplier ID"
              value={formData.supplier_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="location_id"
              placeholder="Location ID"
              value={formData.location_id}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="expected_date"
              value={formData.expected_date}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />

          <button type="submit" className="btn btn-success">Create Order</button>
        </form>
      )}

      {loading ? (
        <p>Loading purchase orders...</p>
      ) : orders.length === 0 ? (
        <p className="empty-message">No purchase orders yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Expected Date</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.po_number}</td>
                  <td>{order.supplier_id}</td>
                  <td>
                    <span 
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{order.expected_date ? new Date(order.expected_date).toLocaleDateString() : '-'}</td>
                  <td>${order.total_amount?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;