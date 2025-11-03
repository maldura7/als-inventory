import React, { useState, useEffect } from 'react';
import { transfersAPI, locationsAPI } from '../services/api';
import '../styles/Table.css';

const Transfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    from_location_id: '',
    to_location_id: '',
    transfer_number: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [transData, locData] = await Promise.all([
        transfersAPI.getAll(token),
        locationsAPI.getAll(token)
      ]);
      setTransfers(transData.data || []);
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
      await transfersAPI.create(formData, token);
      setFormData({
        from_location_id: '',
        to_location_id: '',
        transfer_number: '',
        notes: ''
      });
      setShowForm(false);
      fetchData();
      alert('Transfer created successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Error creating transfer');
    }
  };

  const getLocationName = (id) => {
    const location = locations.find(l => l.id === id);
    return location?.name || 'Unknown';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#f39c12',
      'in_transit': '#3498db',
      'completed': '#27ae60',
      'cancelled': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🚚 Stock Transfers</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Transfer'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Create Stock Transfer</h3>
          
          <div className="form-row">
            <select
              name="from_location_id"
              value={formData.from_location_id}
              onChange={handleChange}
              required
            >
              <option value="">From Location</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <select
              name="to_location_id"
              value={formData.to_location_id}
              onChange={handleChange}
              required
            >
              <option value="">To Location</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <input
              type="text"
              name="transfer_number"
              placeholder="Transfer Number"
              value={formData.transfer_number}
              onChange={handleChange}
              required
            />
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
          />

          <button type="submit" className="btn btn-success">Create Transfer</button>
        </form>
      )}

      {loading ? (
        <p>Loading transfers...</p>
      ) : transfers.length === 0 ? (
        <p className="empty-message">No transfers yet.</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transfer Number</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Transfer Date</th>
                <th>Received Date</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map(transfer => (
                <tr key={transfer.id}>
                  <td>{transfer.transfer_number}</td>
                  <td>{getLocationName(transfer.from_location_id)}</td>
                  <td>{getLocationName(transfer.to_location_id)}</td>
                  <td>
                    <span 
                      style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(transfer.status),
                        color: 'white',
                        fontSize: '12px'
                      }}
                    >
                      {transfer.status}
                    </span>
                  </td>
                  <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                  <td>{transfer.received_date ? new Date(transfer.received_date).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transfers;