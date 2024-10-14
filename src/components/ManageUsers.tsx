import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface User {
  id: number;
  username: string;
  role: string;
}

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {users.map(user => (
          <li key={user.id} className="mb-4 p-4 border rounded">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <button
              onClick={() => handleDelete(user.id)}
              className="bg-red-500 text-white px-2 py-1 rounded mt-2 hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
