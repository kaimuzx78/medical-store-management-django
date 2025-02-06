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

const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');
  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/add-medicine" element={<PrivateRoute><AddMedicine /></PrivateRoute>} />
        <Route path="/company" element={<PrivateRoute><Company /></PrivateRoute>} />
        <Route path="/manage-medicine" element={<PrivateRoute><ManageMedicine /></PrivateRoute>} />
        <Route path="/manage-company-account" element={<PrivateRoute><ManageCompany /></PrivateRoute>} />
        <Route path="/manage-employee" element={<PrivateRoute><ManageEmployee /></PrivateRoute>} />
        <Route path="/generate-bill" element={<PrivateRoute><GenerateBill /></PrivateRoute>} />
        <Route path="/customer-request" element={<PrivateRoute><CustomerRequest /></PrivateRoute>} />
        <Route path="/bill-history" element={<PrivateRoute><BillHistory /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App; 