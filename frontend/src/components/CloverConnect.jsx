import React, { useState, useEffect } from 'react';

const CloverConnect = () => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clover/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setConnected(data.connected);
    } catch (err) {
      console.error('Error checking Clover status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clover/connect', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to connect to Clover');
    }
  };

  const syncProducts = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clover/sync-products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert('Failed to sync products');
    } finally {
      setSyncing(false);
    }
  };

  const syncInventory = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clover/sync-inventory', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      alert('Failed to sync inventory');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{
      background: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    }}>
      <h3>🍀 Clover Integration</h3>
      
      {connected ? (
        <div>
          <p><strong>Status:</strong> ✅ Connected</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={syncProducts} disabled={syncing} style={{
              padding: '10px 16px', background: '#28a745', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>
              {syncing ? 'Syncing...' : '📤 Sync Products'}
            </button>
            <button onClick={syncInventory} disabled={syncing} style={{
              padding: '10px 16px', background: '#17a2b8', color: 'white',
              border: 'none', borderRadius: '6px', cursor: 'pointer'
            }}>
              {syncing ? 'Syncing...' : '📊 Sync Inventory'}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={handleConnect} style={{
          padding: '12px 24px', background: '#007bff', color: 'white',
          border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
        }}>
          🍀 Connect to Clover
        </button>
      )}
    </div>
  );
};

export default CloverConnect;