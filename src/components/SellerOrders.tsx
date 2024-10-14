import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface OrderItem {
  id: number;
  order_date: string;
  total_amount: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
}

const SellerOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [error, setError] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Orders</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {orders.map(order => (
          <li key={`${order.id}-${order.product_id}`} className="mb-4 p-4 border rounded">
            <p>Order ID: {order.id}</p>
            <p>Date: {new Date(order.order_date).toLocaleString()}</p>
            <p>Product: {order.product_name}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Price: ${order.price}</p>
            <p>Subtotal: ${order.quantity * order.price}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SellerOrders;
