import React, { useState } from 'react';
import AddProduct from '../components/AddProduct';
import ManageProducts from '../components/ManageProducts';
import SellerOrders from '../components/SellerOrders';

const SellerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('add');

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add')}
        >
          Add Product
        </button>
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Products
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('orders')}
        >
          View Orders
        </button>
      </div>
      {activeTab === 'add' && <AddProduct />}
      {activeTab === 'manage' && <ManageProducts />}
      {activeTab === 'orders' && <SellerOrders />}
    </div>
  );
};

export default SellerDashboard;
