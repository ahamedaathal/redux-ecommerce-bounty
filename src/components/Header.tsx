import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';

const Header: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.token !== null);
  const user = useSelector((state: RootState) => state.auth.user);
  const cartItemCount = useSelector((state: RootState) => state.cart.reduce((total, item) => total + item.quantity, 0));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">E-commerce Store</Link>
        <nav>
          <Link to="/" className="mr-4">Home</Link>
          {isAuthenticated && user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="mr-4">Admin Dashboard</Link>
              )}
              {user.role === 'seller' && (
                <Link to="/seller" className="mr-4">Seller Dashboard</Link>
              )}
              {user.role === 'shopper' && (
                <>
                  <Link to="/products" className="mr-4">Products</Link>
                  <Link to="/cart" className="mr-4">Cart ({cartItemCount})</Link>
                </>
              )}
              <button onClick={handleLogout} className="bg-red-500 px-2 py-1 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/register" className="mr-4">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;