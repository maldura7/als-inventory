import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import '../styles/Table.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    cost: '',
    price: '',
    barcode: '',
    reorder_point: '10',
    reorder_quantity: '50'
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const data = await productsAPI.getAll(token);
      setProducts(data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
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
      await productsAPI.create(formData, token);
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        cost: '',
        price: '',
        barcode: '',
        reorder_point: '10',
        reorder_quantity: '50'
      });
      setShowForm(false);
      fetchProducts();
      alert('Product created successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Error creating product');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📦 Products</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-container">
          <h3>Add New Product</h3>
          
          <div className="form-row">
            <input
              type="text"
              name="sku"
              placeholder="SKU"
              value={formData.sku}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="number"
              name="cost"
              placeholder="Cost"
              value={formData.cost}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
            />
            <input
              type="text"
              name="barcode"
              placeholder="Barcode"
              value={formData.barcode}
              onChange={handleChange}
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />

          <button type="submit" className="btn btn-success">Create Product</button>
        </form>
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-message">No products yet. Create your first product!</p>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Category</th>
                <th>Cost</th>
                <th>Price</th>
                <th>Barcode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.category || '-'}</td>
                  <td>${product.cost?.toFixed(2)}</td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td>{product.barcode || '-'}</td>
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

export default Products;