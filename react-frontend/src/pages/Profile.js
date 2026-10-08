import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiService } from '../services/apiService';
import '../../styles/ApplicantComponents.css';
const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await apiService.getUserProfile();
      setUser(response.data);
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
        bio: response.data.bio || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateUserProfile(formData);
      setUser({ ...user, ...formData });
      setEditing(false);
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Header user={user} />
        
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Profile</h1>
            <p className="page-subtitle">Manage your personal information</p>
          </div>

          <div className="content-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                <i className="fas fa-user"></i>
              </div>
              <div className="profile-info-large">
                <h2>{user?.name}</h2>
                <p>{user?.email}</p>
                <span className="profile-badge">Job Seeker</span>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => setEditing(!editing)}
              >
                <i className={`fas fa-${editing ? 'times' : 'edit'}`}></i>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-save"></i>
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Full Name</label>
                    <p>{user?.name || 'Not provided'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <p>{user?.email || 'Not provided'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <p>{user?.phone || 'Not provided'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Location</label>
                    <p>{user?.location || 'Not provided'}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Bio</label>
                    <p>{user?.bio || 'No bio provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
