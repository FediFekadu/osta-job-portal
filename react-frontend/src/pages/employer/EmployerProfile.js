import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import '../../styles/EmployerComponents.css';

const EmployerProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    company_name: '',
    company_description: '',
    industry: '',
    company_size: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    logo: null,
    founded_year: '',
    benefits: '',
    culture: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmployerProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!profile.industry.trim()) newErrors.industry = 'Industry is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    if (!profile.phone.trim()) newErrors.phone = 'Phone is required';
    
    if (profile.email && !/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = 'Please enter a valid website URL (include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (profile[key] !== null && profile[key] !== '') {
          formData.append(key, profile[key]);
        }
      });

      await apiService.updateEmployerProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="employer-profile-page">
      <div className="page-header">
        <h1>Company Profile</h1>
        <p>Manage your company information and branding</p>
      </div>

      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {errors.submit && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {errors.submit}
          </div>
        )}

        <div className="form-grid">
          {/* Company Information */}
          <div className="form-section">
            <h2>Company Information</h2>
            
            <div className="form-group">
              <label htmlFor="company_name">Company Name *</label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={profile.company_name}
                onChange={handleChange}
                className={`form-input ${errors.company_name ? 'error' : ''}`}
                placeholder="Your Company Name"
              />
              {errors.company_name && <span className="error-text">{errors.company_name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="company_description">Company Description</label>
              <textarea
                id="company_description"
                name="company_description"
                value={profile.company_description}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                placeholder="Describe your company, mission, and values..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="industry">Industry *</label>
                <select
                  id="industry"
                  name="industry"
                  value={profile.industry}
                  onChange={handleChange}
                  className={`form-input ${errors.industry ? 'error' : ''}`}
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="consulting">Consulting</option>
                  <option value="government">Government</option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="other">Other</option>
                </select>
                {errors.industry && <span className="error-text">{errors.industry}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="company_size">Company Size</label>
                <select
                  id="company_size"
                  name="company_size"
                  value={profile.company_size}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="founded_year">Founded Year</label>
                <input
                  type="number"
                  id="founded_year"
                  name="founded_year"
                  value={profile.founded_year}
                  onChange={handleChange}
                  className="form-input"
                  min="1800"
                  max={new Date().getFullYear()}
                  placeholder="2020"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={profile.website}
                  onChange={handleChange}
                  className={`form-input ${errors.website ? 'error' : ''}`}
                  placeholder="https://www.yourcompany.com"
                />
                {errors.website && <span className="error-text">{errors.website}</span>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h2>Contact Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="contact@yourcompany.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                className="form-input"
                placeholder="123 Business St"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="New York"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="zip_code">ZIP Code</label>
                <input
                  type="text"
                  id="zip_code"
                  name="zip_code"
                  value={profile.zip_code}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="10001"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="United States"
                />
              </div>
            </div>
          </div>

          {/* Company Culture */}
          <div className="form-section full-width">
            <h2>Company Culture & Benefits</h2>
            
            <div className="form-group">
              <label htmlFor="culture">Company Culture</label>
              <textarea
                id="culture"
                name="culture"
                value={profile.culture}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                placeholder="Describe your company culture, work environment, and values..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Benefits & Perks</label>
              <textarea
                id="benefits"
                name="benefits"
                value={profile.benefits}
                onChange={handleChange}
                className="form-textarea"
                rows="4"
                placeholder="List the benefits and perks you offer to employees..."
              />
            </div>
          </div>

          {/* Company Logo */}
          <div className="form-section">
            <h2>Company Logo</h2>
            
            <div className="form-group">
              <label htmlFor="logo">Upload Logo</label>
              <input
                type="file"
                id="logo"
                name="logo"
                onChange={handleChange}
                className="form-input"
                accept="image/*"
              />
              <small className="form-help">
                Upload your company logo (PNG, JPG, or SVG recommended)
              </small>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/employer/dashboard')}
            className="btn btn-outline btn-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployerProfile;
