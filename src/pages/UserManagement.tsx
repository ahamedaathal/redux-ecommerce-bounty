import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setUsers, removeUser, setLoading, setError } from '../store/slices/userSlice';
import axios from 'axios';

const UserManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('shopper');

  useEffect(() => {
    const fetchUsers = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        dispatch(setUsers(response.data));
      } catch (err) {
        dispatch(setError('Failed to fetch users'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  }, [dispatch, currentUser]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users', 
        { username: newUsername, password: newPassword, role: newRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      dispatch(setUsers([...users, response.data]));
      setNewUsername('');
      setNewPassword('');
      setNewRole('shopper');
    } catch (err) {
      dispatch(setError('Failed to add user'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      dispatch(removeUser(userId));
    } catch (err) {
      dispatch(setError('Failed to delete user'));
    }
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="text-red-500">Only admins can access this page.</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <form onSubmit={handleAddUser} className="mb-8 space-y-4">
        <div>
          <label htmlFor="newUsername" className="block mb-1">Username</label>
          <input
            type="text"
            id="newUsername"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block mb-1">Password</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="newRole" className="block mb-1">Role</label>
          <select
            id="newRole"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="shopper">Shopper</option>
            <option value="seller">Seller</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Add User
        </button>
      </form>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Username</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.username}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;