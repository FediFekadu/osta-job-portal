import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    performLogout();
  }, []);

  const performLogout = async () => {
    try {
      // Call logout API to clear server-side session
      await apiService.post('/api/auth/logout.php');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear client-side authentication state
      logout();
      
      // Redirect to home page with logout message
      navigate('/', { 
        state: { message: 'You have been logged out successfully.' }
      });
    }
  };

  return (
    <div className="logout-page">
      <div className="logout-container">
        <div className="logout-spinner">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <h2>Logging out...</h2>
        <p>Please wait while we securely log you out.</p>
      </div>
    </div>
  );
};

export default Logout;
