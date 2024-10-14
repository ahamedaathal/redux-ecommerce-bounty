import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { fetchProducts } from '../store/slices/productSlice';

interface Order {
  id: number;
  order_date: string;
  total_amount: number;
}

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    dispatch(fetchProducts() as any);
    if (user && user.role === 'shopper') {
      fetchOrderHistory();
    }
  }, [dispatch, user]);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to our E-commerce Store</h1>
      {user ? (
        <>
          <p>Hello, {user.username}!</p>
          {user.role === 'shopper' && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Your Order History</h2>
              {orders.length > 0 ? (
                <ul>
                  {orders.map((order) => (
                    <li key={order.id} className="mb-4 p-4 border rounded">
                      <p>Order ID: {order.id}</p>
                      <p>Date: {new Date(order.order_date).toLocaleString()}</p>
                      <p>Total Amount: ${order.total_amount.toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>You haven't placed any orders yet.</p>
              )}
            </div>
          )}
        </>
      ) : (
        <p>Please login to view your personalized content.</p>
      )}
    </div>
  );
};

export default Home;