import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { clearCart, CartItem } from '../store/slices/cartSlice';
import { fetchProducts } from '../store/slices/productSlice';

const Checkout: React.FC = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/products/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item: CartItem) => ({ 
            id: item.id,
            quantity: item.quantity 
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred during checkout');
      }

      dispatch(clearCart());
      dispatch(fetchProducts()); // Fetch updated products
      navigate('/order-success');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="mb-4">
            {cart.map((item: CartItem) => (
              <li key={item.id} className="mb-2">
                {item.name} - Quantity: {item.quantity} - Price: ${item.price * item.quantity}
              </li>
            ))}
          </ul>
          <p className="font-bold mb-4">
            Total: ${cart.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0)}
          </p>
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  );
};

export default Checkout;
