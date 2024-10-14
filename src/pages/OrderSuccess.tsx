import React from 'react';
import { Link } from 'react-router-dom';

const OrderSuccess: React.FC = () => {
  return (
    <div className="container mx-auto mt-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
      <p className="mb-4">Thank you for your purchase. Your order has been placed successfully.</p>
      <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back to Home
      </Link>
    </div>
  );
};

export default OrderSuccess;
