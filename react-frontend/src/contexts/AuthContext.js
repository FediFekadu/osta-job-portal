import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create axios instance for auth - using proxy, no CORS needed
const authAPI = axios.create({
  baseURL: '/api/auth',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const response = await authAPI.get('/user.php');
      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.post('/login.php', credentials);
      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.post('/register.php', userData);
      if (response.data && response.data.success && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.post('/logout.php');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
