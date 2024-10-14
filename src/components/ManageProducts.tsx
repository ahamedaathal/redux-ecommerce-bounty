import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching products:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      setError((err as Error).message);
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Products</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id} className="mb-4 p-4 border rounded">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Quantity: {product.quantity}</p>
              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-2 py-1 rounded mt-2 hover:bg-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ManageProducts;
