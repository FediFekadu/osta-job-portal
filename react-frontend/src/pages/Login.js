import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await login(formData);
    
    if (result.success) {
      setSuccess('Login successful!');
      // Redirect based on user role
      const userRole = result.user.role;
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'employer') {
          navigate('/employer/dashboard');
        } else {
          navigate('/applicant/dashboard');
        }
      }, 1000);
    } else {
      setError(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <i className="fas fa-briefcase"></i>
          </div>
          <h1>OSTA Job Portal</h1>
          <p>Professional Career Management System</p>
        </div>

        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="login-form">
            <h2>Sign In to Your Account</h2>
            
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
            
            {success && (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                {success}
              </div>
            )}



            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Sign In
                </>
              )}
            </button>

            <div className="login-footer">
              <div className="login-links">
                <a href="/register" className="register-link">
                  Job Seeker? Register here
                </a>
                <p className="admin-note">
                  <small>Admin & Employer accounts are created by administrators</small>
                </p>
              </div>
            </div>
          </form>
        </div>

        <div className="login-features">
          <div className="feature-grid">
            <div className="feature-item">
              <i className="fas fa-search"></i>
              <h3>Find Jobs</h3>
              <p>Browse thousands of job opportunities</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-users"></i>
              <h3>Hire Talent</h3>
              <p>Connect with qualified candidates</p>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-line"></i>
              <h3>Track Progress</h3>
              <p>Monitor applications and analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
