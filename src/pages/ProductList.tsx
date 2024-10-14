import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { RootState, AppDispatch } from '../store';
import { Product } from '../types/Product';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.products.items);
  const status = useSelector((state: RootState) => state.products.status);
  const error = useSelector((state: RootState) => state.products.error);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities({ ...quantities, [productId]: quantity });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    dispatch(addToCart({ ...product, quantity }));
    setQuantities({ ...quantities, [product.id]: 0 });
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <ul>
        {products.map((product: Product) => (
          <li key={product.id} className="mb-4 p-4 border rounded">
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p>Price: ${product.price}</p>
            <p>Available: {product.quantity}</p>
            {product.quantity > 0 ? (
              <div className="mt-2">
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantities[product.id] || 1}
                  onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                  className="border rounded px-2 py-1 w-16 mr-2"
                />
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add to Cart
                </button>
              </div>
            ) : (
              <p className="text-red-500 mt-2">Out of Stock</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;