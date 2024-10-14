import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addProduct } from '../store/slices/productSlice';
import { RootState } from '../store';
import axios from 'axios';

const ProductForm: React.FC = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'seller') {
      setError('Only sellers can add products');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/products', 
        { name, price: parseFloat(price), quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      dispatch(addProduct(response.data));
      navigate('/products');
    } catch (err) {
      setError('Failed to add product');
    }
  };

  if (!user || user.role !== 'seller') {
    return <div className="text-red-500">Only sellers can access this page.</div>;
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1">Product Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="price" className="block mb-1">Price</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="quantity" className="block mb-1">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
            min="0"
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;