import React from 'react';
import { Link } from 'react-router-dom';

const BuyerDashboard: React.FC = () => {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
      <ul>
        <li><Link to="/products" className="text-blue-500 hover:underline">Browse Products</Link></li>
        <li><Link to="/cart" className="text-blue-500 hover:underline">View Cart</Link></li>
        <li><a href="#" className="text-blue-500 hover:underline">Order History</a></li>
      </ul>
    </div>
  );
};

export default BuyerDashboard;
