import React, { useState } from 'react';
import AddUser from '../components/AddUser';
import ManageUsers from '../components/ManageUsers';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('manage');

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'manage' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Users
        </button>
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add')}
        >
          Add User
        </button>
      </div>
      {activeTab === 'manage' && <ManageUsers />}
      {activeTab === 'add' && <AddUser />}
    </div>
  );
};

export default AdminDashboard;
