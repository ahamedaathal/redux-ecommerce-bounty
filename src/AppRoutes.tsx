import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<ProductList />} />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/order-success" 
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/seller" 
        element={
          <ProtectedRoute allowedRoles={['seller']}>
            <SellerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/shopper" 
        element={
          <ProtectedRoute allowedRoles={['shopper']}>
            <BuyerDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
