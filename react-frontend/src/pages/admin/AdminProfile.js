import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const AdminProfile = () => {
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'admin',
    avatar: '',
    bio: '',
    department: '',
    join_date: '',
    last_login: '',
    permissions: [],
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      sms_notifications: false,
      dashboard_layout: 'default'
    }
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: 'fas fa-user' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
    { id: 'activity', label: 'Activity Log', icon: 'fas fa-history' }
  ];

  const themes = [
    { value: 'light', label: 'Light Theme' },
    { value: 'dark', label: 'Dark Theme' },
    { value: 'auto', label: 'Auto (System)' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ar', name: 'Arabic' }
  ];

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai'
  ];

  const [activityLog, setActivityLog] = useState([]);

  useEffect(() => {
    fetchProfile();
    if (activeTab === 'activity') {
      fetchActivityLog();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminProfile();
      setProfile({ ...profile, ...response.data });
      if (response.data.avatar) {
        setPreviewUrl(response.data.avatar);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await apiService.getAdminActivityLog();
      setActivityLog(response.data || []);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePreferenceChange = (key, value) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Avatar file size must be less than 5MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Avatar must be a JPEG, PNG, or GIF image');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profile_data', JSON.stringify(profile));
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await apiService.updateAdminProfile(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
      if (avatarFile) {
        setAvatarFile(null);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    setError('');

    try {
      await apiService.changeAdminPassword(passwordData);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const enable2FA = async () => {
    try {
      const response = await apiService.enable2FA();
      setSuccess('Two-factor authentication enabled successfully!');
      // Handle QR code display or backup codes
      console.log('2FA Setup:', response.data);
    } catch (error) {
      setError('Failed to enable two-factor authentication');
    }
  };

  const disable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable two-factor authentication?')) return;
    
    try {
      await apiService.disable2FA();
      setSuccess('Two-factor authentication disabled');
    } catch (error) {
      setError('Failed to disable two-factor authentication');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={saveProfile}>
            <div className="admin-row">
              <div className="admin-col-md-4">
                <div className="admin-text-center admin-mb-4">
                  <div className="admin-avatar-upload">
                    <div className="admin-avatar-preview">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Avatar" className="admin-avatar-img" />
                      ) : (
                        <div className="admin-avatar-placeholder">
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <label className="admin-avatar-upload-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        style={{ display: 'none' }}
                      />
                      <i className="fas fa-camera"></i>
                      Change Avatar
                    </label>
                  </div>
                </div>
                <div className="admin-profile-stats">
                  <div className="admin-stat-item">
                    <strong>Member Since</strong>
                    <span>{profile.join_date ? new Date(profile.join_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="admin-stat-item">
                    <strong>Last Login</strong>
                    <span>{profile.last_login ? new Date(profile.last_login).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="admin-stat-item">
                    <strong>Role</strong>
                    <span className="admin-badge admin-badge-primary">{profile.role}</span>
                  </div>
                </div>
              </div>
              <div className="admin-col-md-8">
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        value={profile.full_name}
                        onChange={handleProfileChange}
                        className="admin-form-control"
                        required
                      />
                    </div>
                  </div>
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="admin-form-control"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        className="admin-form-control"
                      />
                    </div>
                  </div>
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={profile.department}
                        onChange={handleProfileChange}
                        className="admin-form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Bio</label>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    className="admin-form-control"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          </form>
        );

      case 'security':
        return (
          <div className="admin-row">
            <div className="admin-col-md-6">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>Change Password</h4>
                </div>
                <div className="admin-card-body">
                  <form onSubmit={changePassword}>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Current Password *</label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                        className="admin-form-control"
                        required
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">New Password *</label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                        className="admin-form-control"
                        required
                        minLength="8"
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Confirm New Password *</label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                        className="admin-form-control"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="admin-btn admin-btn-primary"
                      disabled={changingPassword}
                    >
                      {changingPassword ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-card">
                <div className="admin-card-header">
                  <h4>Two-Factor Authentication</h4>
                </div>
                <div className="admin-card-body">
                  <p className="admin-text-muted admin-mb-3">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <div className="admin-d-flex admin-gap-2">
                    <button
                      className="admin-btn admin-btn-success"
                      onClick={enable2FA}
                    >
                      <i className="fas fa-shield-alt"></i>
                      Enable 2FA
                    </button>
                    <button
                      className="admin-btn admin-btn-outline admin-btn-danger"
                      onClick={disable2FA}
                    >
                      <i className="fas fa-times"></i>
                      Disable 2FA
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="admin-card admin-mt-3">
                <div className="admin-card-header">
                  <h4>Login Sessions</h4>
                </div>
                <div className="admin-card-body">
                  <p className="admin-text-muted admin-mb-3">
                    Manage your active login sessions across different devices.
                  </p>
                  <button className="admin-btn admin-btn-outline admin-btn-danger">
                    <i className="fas fa-sign-out-alt"></i>
                    Logout All Devices
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="admin-row">
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Theme</label>
                <select
                  value={profile.preferences.theme}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="admin-form-control"
                >
                  {themes.map(theme => (
                    <option key={theme.value} value={theme.value}>{theme.label}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Language</label>
                <select
                  value={profile.preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="admin-form-control"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Timezone</label>
                <select
                  value={profile.preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="admin-form-control"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Notifications</label>
                <div className="admin-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.preferences.email_notifications}
                      onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                      className="admin-checkbox"
                    />
                    <span className="admin-ml-2">Email Notifications</span>
                  </label>
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.preferences.sms_notifications}
                      onChange={(e) => handlePreferenceChange('sms_notifications', e.target.checked)}
                      className="admin-checkbox"
                    />
                    <span className="admin-ml-2">SMS Notifications</span>
                  </label>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Dashboard Layout</label>
                <select
                  value={profile.preferences.dashboard_layout}
                  onChange={(e) => handlePreferenceChange('dashboard_layout', e.target.value)}
                  className="admin-form-control"
                >
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="expanded">Expanded</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="admin-activity-log">
            {activityLog.length === 0 ? (
              <div className="admin-text-center admin-py-5">
                <i className="fas fa-history admin-text-muted" style={{fontSize: '3rem'}}></i>
                <p className="admin-text-muted admin-mt-3">No activity recorded</p>
              </div>
            ) : (
              <div className="admin-activity-list">
                {activityLog.map((activity, index) => (
                  <div key={index} className="admin-activity-item">
                    <div className="admin-activity-icon">
                      <i className={`fas ${activity.icon || 'fa-circle'}`}></i>
                    </div>
                    <div className="admin-activity-content">
                      <h5>{activity.action}</h5>
                      <p className="admin-text-muted">{activity.description}</p>
                      <small className="admin-text-muted">
                        <i className="fas fa-clock"></i>
                        {new Date(activity.timestamp).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-text-center admin-mt-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-user-cog"></i>
          Admin Profile
        </h1>
        <p className="admin-page-subtitle">Manage your account settings and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="admin-alert admin-alert-success admin-mb-4">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      {error && (
        <div className="admin-alert admin-alert-danger admin-mb-4">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Profile Form */}
      <div className="admin-card">
        {/* Tab Navigation */}
        <div className="admin-card-header">
          <div className="admin-nav-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`admin-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="admin-card-body">
          {renderTabContent()}
        </div>

        {/* Form Actions */}
        {(activeTab === 'profile' || activeTab === 'preferences') && (
          <div className="admin-card-footer">
            <div className="admin-d-flex admin-justify-end admin-gap-2">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={fetchProfile}
                disabled={saving}
              >
                <i className="fas fa-undo"></i>
                Reset
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                onClick={saveProfile}
                disabled={saving}
              >
                <i className="fas fa-save"></i>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
