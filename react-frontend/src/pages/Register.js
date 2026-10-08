import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register({
      full_name: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    });

    if (result.success) {
      setSuccess('Registration successful! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/applicant/dashboard');
      }, 2000);
    } else {
      setError(result.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1>Join OSTA Job Portal</h1>
          <p>Create your job seeker account</p>
        </div>

        <div className="register-form-container">
          <form onSubmit={handleSubmit} className="register-form">
            <h2>Create Your Account</h2>
            
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <div className="input-with-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-with-icon">
                <i className="fas fa-phone"></i>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">Confirm Password *</label>
                <div className="input-with-icon">
                  <i className="fas fa-lock"></i>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Create Account
                </>
              )}
            </button>

            <div className="register-footer">
              <div className="register-links">
                <a href="/login" className="login-link">
                  Already have an account? Sign in here
                </a>
              </div>
              
              <div className="register-note">
                <p><small>* Required fields</small></p>
                <p><small>By registering, you agree to our Terms of Service and Privacy Policy</small></p>
              </div>
            </div>
          </form>
        </div>

        <div className="register-benefits">
          <h3>Why Join OSTA Job Portal?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <i className="fas fa-search"></i>
              <h4>Find Your Dream Job</h4>
              <p>Access thousands of job opportunities from top employers</p>
            </div>
            <div className="benefit-item">
              <i className="fas fa-bell"></i>
              <h4>Job Alerts</h4>
              <p>Get notified when jobs matching your skills are posted</p>
            </div>
            <div className="benefit-item">
              <i className="fas fa-chart-line"></i>
              <h4>Track Applications</h4>
              <p>Monitor your job applications and their status</p>
            </div>
            <div className="benefit-item">
              <i className="fas fa-bookmark"></i>
              <h4>Save Jobs</h4>
              <p>Bookmark interesting positions to apply later</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
