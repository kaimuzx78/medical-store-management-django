import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/AddMedicine';
import Company from './pages/Company';
import ManageMedicine from './pages/ManageMedicine';
import ManageCompanyAccount from './pages/ManageCompanyAccount';
import ManageEmployee from './pages/ManageEmployee';
import GenerateBill from './pages/GenerateBill';
import CustomerRequest from './pages/CustomerRequest';
import ManageCompany from './pages/ManageCompany';
import BillHistory from './pages/BillHistory';
import UserDashboard from './pages/UserDashboard';
import OrderMedicine from './pages/OrderMedicine';
import Register from './pages/Register';
import UserLayout from './components/UserLayout';
import OrderHistory from './pages/OrderHistory';
import UserProfile from './pages/UserProfile';
import ManageOrders from './pages/ManageOrders';

// Separate route components for different user types
const AdminRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const isAdmin = localStorage.getItem('userRole') === 'admin';
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/user/dashboard" />;
  
  return <MainLayout>{children}</MainLayout>;
};

const UserRouteWithLayout = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  const isUser = localStorage.getItem('userRole') === 'user';
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isUser) return <Navigate to="/dashboard" />;
  
  return <UserLayout>{children}</UserLayout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserRouteWithLayout><UserDashboard /></UserRouteWithLayout>} />
        <Route path="/user/order-medicine" element={<UserRouteWithLayout><OrderMedicine /></UserRouteWithLayout>} />
        <Route path="/user/order-history" element={<UserRouteWithLayout><OrderHistory /></UserRouteWithLayout>} />
        <Route path="/user/profile" element={<UserRouteWithLayout><UserProfile /></UserRouteWithLayout>} />
        
        {/* Admin Routes */}
        <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/add-medicine" element={<AdminRoute><AddMedicine /></AdminRoute>} />
        <Route path="/company" element={<AdminRoute><Company /></AdminRoute>} />
        <Route path="/manage-medicine" element={<AdminRoute><ManageMedicine /></AdminRoute>} />
        <Route path="/manage-company-account" element={<AdminRoute><ManageCompany /></AdminRoute>} />
        <Route path="/manage-employee" element={<AdminRoute><ManageEmployee /></AdminRoute>} />
        <Route path="/generate-bill" element={<AdminRoute><GenerateBill /></AdminRoute>} />
        <Route path="/customer-request" element={<AdminRoute><CustomerRequest /></AdminRoute>} />
        <Route path="/bill-history" element={<AdminRoute><BillHistory /></AdminRoute>} />
        <Route path="/manage-orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App; 