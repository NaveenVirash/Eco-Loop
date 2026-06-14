import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavbarNew from './components/NavbarNew';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import ProductListing from './pages/ProductListing';
import PostAd from './pages/PostAd';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterCompany from './pages/RegisterCompany';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DashboardContainer from './pages/DashboardContainer';
import './styles/GlobalStyles.css';
import './App.css';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavbarNew />
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <HomePage />
                <ProductListing />
                <Leaderboard />
              </>
            } 
          />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/post" element={<PostAd />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-company" element={<RegisterCompany />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardContainer />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
