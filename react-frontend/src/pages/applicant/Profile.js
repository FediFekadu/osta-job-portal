import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    experience: '',
    skills: '',
    resume: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApplicantProfile();
      if (response.success) {
        setProfileData(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfileData(prev => ({
      ...prev,
      resume: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');

      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      });

      const response = await apiService.updateApplicantProfile(formData);
      if (response.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Error updating profile: ' + response.error);
      }
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Keep your information up to date to improve your job prospects</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={profileData.full_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Professional Information</h3>
          
          <div className="form-group">
            <label htmlFor="education">Education</label>
            <textarea
              id="education"
              name="education"
              value={profileData.education}
              onChange={handleInputChange}
              rows="4"
              placeholder="List your educational background..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Work Experience</label>
            <textarea
              id="experience"
              name="experience"
              value={profileData.experience}
              onChange={handleInputChange}
              rows="4"
              placeholder="Describe your work experience..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <textarea
              id="skills"
              name="skills"
              value={profileData.skills}
              onChange={handleInputChange}
              rows="3"
              placeholder="List your key skills..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume/CV</label>
            <input
              type="file"
              id="resume"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <small className="form-text">
              Upload your resume in PDF, DOC, or DOCX format (max 5MB)
            </small>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save me-2"></i>
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
