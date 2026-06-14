import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token and get user data on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          const response = await axios.get('/api/auth/me', config);
          setUser(response.data.data);
        } catch (error) {
          console.log('Token verification failed');
          setToken(null);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, [token]);

  const register = async (name, email, password, role = 'user', phone = '', address = '') => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        role,
        phone,
        address
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      // Fetch user data after registration
      try {
        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        setUser(userResponse.data.data);
      } catch (error) {
        console.log('Could not fetch user data');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password
      });
      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      
      // Fetch user data after login
      try {
        const userResponse = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        setUser(userResponse.data.data);
      } catch (error) {
        console.log('Could not fetch user data');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const updateUserProfile = async (name, phone, address) => {
    try {
      const response = await axios.put('/api/auth/updatedetails', { name, phone, address }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
