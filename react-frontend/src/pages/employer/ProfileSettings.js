import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import '../../styles/ProfileSettings.css';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile form data
  const [profileData, setProfileData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    company_size: '',
    industry: '',
    description: ''
  });

  // Password change form data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/employer/profile.php');
      if (response.data.success) {
        setProfileData(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.put('/api/employer/profile.php', profileData);
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('/api/employer/change-password.php', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      if (response.data.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Profile Settings</h1>
          <p>Manage your company profile and account settings</p>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-building"></i>
            Company Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="fas fa-lock"></i>
            Change Password
          </button>
        </div>

        <div className="settings-content">
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="fas fa-check-circle"></i>
              {success}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Company Profile Information</h2>
                <p>Update your company details and contact information</p>
              </div>

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="company_name">Company Name *</label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={profileData.company_name}
                      onChange={handleProfileChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_person">Contact Person *</label>
                    <input
                      type="text"
                      id="contact_person"
                      name="contact_person"
                      value={profileData.contact_person}
                      onChange={handleProfileChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={profileData.website}
                      onChange={handleProfileChange}
                      className="form-control"
                      placeholder="https://www.example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="company_size">Company Size</label>
                    <select
                      id="company_size"
                      name="company_size"
                      value={profileData.company_size}
                      onChange={handleProfileChange}
                      className="form-control"
                    >
                      <option value="">Select Company Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    name="industry"
                    value={profileData.industry}
                    onChange={handleProfileChange}
                    className="form-control"
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Company Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileChange}
                    className="form-control"
                    rows="3"
                    placeholder="Enter complete company address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Company Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={profileData.description}
                    onChange={handleProfileChange}
                    className="form-control"
                    rows="4"
                    placeholder="Brief description of your company and services"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="tab-content">
              <div className="content-header">
                <h2>Change Password</h2>
                <p>Update your account password for security</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="current_password">Current Password *</label>
                  <input
                    type="password"
                    id="current_password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password *</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="form-control"
                    minLength="6"
                    required
                  />
                  <small className="form-text">Password must be at least 6 characters long</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password">Confirm New Password *</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Changing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-key"></i>
                        Change Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
