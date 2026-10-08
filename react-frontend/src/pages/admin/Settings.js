import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    site_name: '',
    site_description: '',
    site_logo: '',
    admin_email: '',
    contact_email: '',
    timezone: '',
    language: 'en',
    
    // Security Settings
    password_min_length: 8,
    require_password_complexity: true,
    session_timeout: 30,
    max_login_attempts: 5,
    enable_2fa: false,
    
    // File Upload Settings
    max_file_size: 10,
    allowed_file_types: 'pdf,doc,docx,jpg,png,jpeg',
    upload_path: '/uploads',
    
    // Email Settings
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    email_from_name: '',
    email_from_address: '',
    
    // System Preferences
    email_notifications: true,
    maintenance_mode: false,
    debug_mode: false,
    cache_enabled: true,
    auto_backup: true,
    backup_frequency: 'daily'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: 'fas fa-cog' },
    { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
    { id: 'files', label: 'File Upload', icon: 'fas fa-upload' },
    { id: 'email', label: 'Email', icon: 'fas fa-envelope' },
    { id: 'system', label: 'System', icon: 'fas fa-server' }
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

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ar', name: 'Arabic' }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSettings();
      setSettings({ ...settings, ...response.data });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await apiService.updateSettings(settings);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testEmailConfiguration = async () => {
    setTestingEmail(true);
    try {
      await apiService.testEmailConfiguration({
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_username: settings.smtp_username,
        smtp_password: settings.smtp_password,
        smtp_encryption: settings.smtp_encryption,
        email_from_address: settings.email_from_address
      });
      setSuccess('Email configuration test successful!');
    } catch (error) {
      setError('Email configuration test failed. Please check your settings.');
    } finally {
      setTestingEmail(false);
    }
  };

  const clearCache = async () => {
    try {
      await apiService.clearCache();
      setSuccess('Cache cleared successfully!');
    } catch (error) {
      setError('Failed to clear cache.');
    }
  };

  const createBackup = async () => {
    try {
      await apiService.createBackup();
      setSuccess('Backup created successfully!');
    } catch (error) {
      setError('Failed to create backup.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="admin-row">
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Site Name *</label>
                <input
                  type="text"
                  name="site_name"
                  value={settings.site_name}
                  onChange={handleChange}
                  className="admin-form-control"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Site Description</label>
                <textarea
                  name="site_description"
                  value={settings.site_description}
                  onChange={handleChange}
                  className="admin-form-control"
                  rows="3"
                  placeholder="Brief description of your job portal"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Admin Email *</label>
                <input
                  type="email"
                  name="admin_email"
                  value={settings.admin_email}
                  onChange={handleChange}
                  className="admin-form-control"
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={settings.contact_email}
                  onChange={handleChange}
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Timezone</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="admin-form-control"
                >
                  <option value="">Select Timezone</option>
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Language</label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="admin-form-control"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Site Logo URL</label>
                <input
                  type="url"
                  name="site_logo"
                  value={settings.site_logo}
                  onChange={handleChange}
                  className="admin-form-control"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="admin-row">
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Minimum Password Length</label>
                <input
                  type="number"
                  name="password_min_length"
                  value={settings.password_min_length}
                  onChange={handleChange}
                  className="admin-form-control"
                  min="6"
                  max="20"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  name="session_timeout"
                  value={settings.session_timeout}
                  onChange={handleChange}
                  className="admin-form-control"
                  min="5"
                  max="480"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Max Login Attempts</label>
                <input
                  type="number"
                  name="max_login_attempts"
                  value={settings.max_login_attempts}
                  onChange={handleChange}
                  className="admin-form-control"
                  min="3"
                  max="10"
                />
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="require_password_complexity"
                    checked={settings.require_password_complexity}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Require Password Complexity</span>
                </label>
                <small className="admin-text-muted">Passwords must contain uppercase, lowercase, numbers, and symbols</small>
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="enable_2fa"
                    checked={settings.enable_2fa}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Enable Two-Factor Authentication</span>
                </label>
                <small className="admin-text-muted">Require 2FA for admin accounts</small>
              </div>
            </div>
          </div>
        );

      case 'files':
        return (
          <div className="admin-row">
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Maximum File Size (MB)</label>
                <input
                  type="number"
                  name="max_file_size"
                  value={settings.max_file_size}
                  onChange={handleChange}
                  className="admin-form-control"
                  min="1"
                  max="100"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Allowed File Types</label>
                <input
                  type="text"
                  name="allowed_file_types"
                  value={settings.allowed_file_types}
                  onChange={handleChange}
                  className="admin-form-control"
                  placeholder="pdf,doc,docx,jpg,png,jpeg"
                />
                <small className="admin-text-muted">Comma-separated list of allowed file extensions</small>
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-form-label">Upload Directory Path</label>
                <input
                  type="text"
                  name="upload_path"
                  value={settings.upload_path}
                  onChange={handleChange}
                  className="admin-form-control"
                  placeholder="/uploads"
                />
                <small className="admin-text-muted">Relative path from project root</small>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div>
            <div className="admin-row">
              <div className="admin-col-md-6">
                <div className="admin-form-group">
                  <label className="admin-form-label">SMTP Host</label>
                  <input
                    type="text"
                    name="smtp_host"
                    value={settings.smtp_host}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SMTP Port</label>
                  <input
                    type="number"
                    name="smtp_port"
                    value={settings.smtp_port}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder="587"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SMTP Username</label>
                  <input
                    type="text"
                    name="smtp_username"
                    value={settings.smtp_username}
                    onChange={handleChange}
                    className="admin-form-control"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SMTP Password</label>
                  <input
                    type="password"
                    name="smtp_password"
                    value={settings.smtp_password}
                    onChange={handleChange}
                    className="admin-form-control"
                  />
                </div>
              </div>
              <div className="admin-col-md-6">
                <div className="admin-form-group">
                  <label className="admin-form-label">Encryption</label>
                  <select
                    name="smtp_encryption"
                    value={settings.smtp_encryption}
                    onChange={handleChange}
                    className="admin-form-control"
                  >
                    <option value="none">None</option>
                    <option value="ssl">SSL</option>
                    <option value="tls">TLS</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">From Name</label>
                  <input
                    type="text"
                    name="email_from_name"
                    value={settings.email_from_name}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder="OSTA Job Portal"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">From Email Address</label>
                  <input
                    type="email"
                    name="email_from_address"
                    value={settings.email_from_address}
                    onChange={handleChange}
                    className="admin-form-control"
                    placeholder="noreply@example.com"
                  />
                </div>
                <div className="admin-form-group">
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={testEmailConfiguration}
                    disabled={testingEmail || !settings.smtp_host}
                  >
                    <i className="fas fa-paper-plane"></i>
                    {testingEmail ? 'Testing...' : 'Test Email Configuration'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="admin-row">
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="email_notifications"
                    checked={settings.email_notifications}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Enable Email Notifications</span>
                </label>
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="maintenance_mode"
                    checked={settings.maintenance_mode}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Maintenance Mode</span>
                </label>
                <small className="admin-text-muted">Disable public access to the site</small>
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="debug_mode"
                    checked={settings.debug_mode}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Debug Mode</span>
                </label>
                <small className="admin-text-muted">Show detailed error messages (development only)</small>
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="cache_enabled"
                    checked={settings.cache_enabled}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Enable Caching</span>
                </label>
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-form-group">
                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    name="auto_backup"
                    checked={settings.auto_backup}
                    onChange={handleChange}
                    className="admin-checkbox"
                  />
                  <span className="admin-ml-2">Enable Automatic Backups</span>
                </label>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Backup Frequency</label>
                <select
                  name="backup_frequency"
                  value={settings.backup_frequency}
                  onChange={handleChange}
                  className="admin-form-control"
                  disabled={!settings.auto_backup}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="admin-form-group">
                <div className="admin-d-flex admin-gap-2">
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={clearCache}
                  >
                    <i className="fas fa-trash"></i>
                    Clear Cache
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={createBackup}
                  >
                    <i className="fas fa-download"></i>
                    Create Backup
                  </button>
                </div>
              </div>
            </div>
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
          <i className="fas fa-cog"></i>
          System Settings
        </h1>
        <p className="admin-page-subtitle">Configure system-wide settings and preferences</p>
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

      {/* Settings Form */}
      <form onSubmit={handleSubmit}>
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
          <div className="admin-card-footer">
            <div className="admin-d-flex admin-justify-end admin-gap-2">
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={fetchSettings}
                disabled={saving}
              >
                <i className="fas fa-undo"></i>
                Reset
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                disabled={saving}
              >
                <i className="fas fa-save"></i>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
