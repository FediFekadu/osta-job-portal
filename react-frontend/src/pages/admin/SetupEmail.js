import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const SetupEmail = () => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [emailConfig, setEmailConfig] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: '',
    from_name: '',
    reply_to: '',
    bounce_email: '',
    max_send_rate: 100,
    daily_limit: 1000,
    enable_logging: true,
    retry_attempts: 3
  });
  const [emailTemplates, setEmailTemplates] = useState({
    welcome: '',
    password_reset: '',
    job_notification: '',
    application_received: '',
    application_status: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [emailStats, setEmailStats] = useState({
    sent_today: 0,
    failed_today: 0,
    queue_size: 0,
    last_sent: null
  });

  const tabs = [
    { id: 'smtp', label: 'SMTP Configuration', icon: 'fas fa-server' },
    { id: 'templates', label: 'Email Templates', icon: 'fas fa-envelope' },
    { id: 'testing', label: 'Testing & Monitoring', icon: 'fas fa-flask' },
    { id: 'settings', label: 'Advanced Settings', icon: 'fas fa-cogs' }
  ];

  const smtpProviders = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587, encryption: 'tls' },
    { name: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, encryption: 'tls' },
    { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, encryption: 'tls' },
    { name: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, encryption: 'tls' },
    { name: 'Mailgun', host: 'smtp.mailgun.org', port: 587, encryption: 'tls' },
    { name: 'Custom', host: '', port: 587, encryption: 'tls' }
  ];

  const templateTypes = [
    { key: 'welcome', label: 'Welcome Email', description: 'Sent to new users upon registration' },
    { key: 'password_reset', label: 'Password Reset', description: 'Sent when users request password reset' },
    { key: 'job_notification', label: 'Job Notification', description: 'Sent to notify users of new jobs' },
    { key: 'application_received', label: 'Application Received', description: 'Confirmation for job applications' },
    { key: 'application_status', label: 'Application Status', description: 'Updates on application status' }
  ];

  useEffect(() => {
    fetchEmailConfig();
    fetchEmailTemplates();
    fetchEmailStats();
  }, []);

  const fetchEmailConfig = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmailConfig();
      setEmailConfig({ ...emailConfig, ...response.data });
    } catch (error) {
      console.error('Error fetching email config:', error);
      setError('Failed to load email configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const response = await apiService.getEmailTemplates();
      setEmailTemplates({ ...emailTemplates, ...response.data });
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await apiService.getEmailStats();
      setEmailStats(response.data || emailStats);
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTemplateChange = (templateKey, value) => {
    setEmailTemplates(prev => ({
      ...prev,
      [templateKey]: value
    }));
  };

  const selectProvider = (provider) => {
    if (provider.name !== 'Custom') {
      setEmailConfig(prev => ({
        ...prev,
        smtp_host: provider.host,
        smtp_port: provider.port,
        smtp_encryption: provider.encryption
      }));
    }
  };

  const saveEmailConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      await apiService.updateEmailConfig(emailConfig);
      setSuccess('Email configuration saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving email config:', error);
      setError('Failed to save email configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveEmailTemplates = async () => {
    setSaving(true);
    setError('');
    
    try {
      await apiService.updateEmailTemplates(emailTemplates);
      setSuccess('Email templates saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving email templates:', error);
      setError('Failed to save email templates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    
    try {
      const response = await apiService.testEmailConnection(emailConfig);
      setConnectionStatus({
        success: response.data.success,
        message: response.data.message
      });
      
      if (response.data.success) {
        setSuccess('SMTP connection successful!');
      } else {
        setError('SMTP connection failed: ' + response.data.message);
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Connection test failed'
      });
      setError('Failed to test SMTP connection');
    } finally {
      setTesting(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setError('Please enter a test email address');
      return;
    }
    
    setTesting(true);
    setError('');
    
    try {
      const response = await apiService.sendTestEmail({
        email: testEmail,
        template: 'test'
      });
      
      if (response.data.success) {
        setSuccess(`Test email sent successfully to ${testEmail}!`);
        fetchEmailStats(); // Refresh stats
      } else {
        setError('Failed to send test email: ' + response.data.message);
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setError('Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  const clearEmailQueue = async () => {
    if (!window.confirm('Are you sure you want to clear the email queue? This cannot be undone.')) return;
    
    try {
      await apiService.clearEmailQueue();
      setSuccess('Email queue cleared successfully!');
      fetchEmailStats();
    } catch (error) {
      setError('Failed to clear email queue');
    }
  };

  const previewTemplate = (templateKey) => {
    // Open template preview modal
    console.log('Preview template:', templateKey);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading email configuration...</p>
      </div>
    );
  }

  const renderSMTPTab = () => (
    <div className="tab-content">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-paper-plane"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.sent_today}</h3>
            <p>Emails Sent Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon error">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.failed_today}</h3>
            <p>Failed Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.queue_size}</h3>
            <p>Queue Size</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{connectionStatus ? (connectionStatus.success ? 'Connected' : 'Failed') : 'Unknown'}</h3>
            <p>Connection Status</p>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-server"></i> SMTP Provider</h3>
          <p>Choose a provider or configure custom SMTP settings</p>
        </div>
        
        <div className="provider-grid">
          {smtpProviders.map((provider) => (
            <div 
              key={provider.name}
              className={`provider-card ${emailConfig.smtp_host === provider.host ? 'active' : ''}`}
              onClick={() => selectProvider(provider)}
            >
              <h4>{provider.name}</h4>
              {provider.host && <p>{provider.host}:{provider.port}</p>}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={saveEmailConfig} className="admin-form">
        <div className="form-section">
          <div className="section-header">
            <h3><i className="fas fa-cog"></i> SMTP Configuration</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="smtp_host">SMTP Host *</label>
              <input
                type="text"
                id="smtp_host"
                name="smtp_host"
                value={emailConfig.smtp_host}
                onChange={handleInputChange}
                placeholder="smtp.gmail.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtp_port">SMTP Port *</label>
              <input
                type="number"
                id="smtp_port"
                name="smtp_port"
                value={emailConfig.smtp_port}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtp_encryption">Encryption</label>
              <select
                id="smtp_encryption"
                name="smtp_encryption"
                value={emailConfig.smtp_encryption}
                onChange={handleInputChange}
              >
                <option value="tls">TLS</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="smtp_username">SMTP Username *</label>
              <input
                type="text"
                id="smtp_username"
                name="smtp_username"
                value={emailConfig.smtp_username}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="smtp_password">SMTP Password *</label>
              <input
                type="password"
                id="smtp_password"
                name="smtp_password"
                value={emailConfig.smtp_password}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3><i className="fas fa-envelope"></i> Email Settings</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="from_email">From Email *</label>
              <input
                type="email"
                id="from_email"
                name="from_email"
                value={emailConfig.from_email}
                onChange={handleInputChange}
                placeholder="noreply@osta.gov"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="from_name">From Name *</label>
              <input
                type="text"
                id="from_name"
                name="from_name"
                value={emailConfig.from_name}
                onChange={handleInputChange}
                placeholder="OSTA Job Portal"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reply_to">Reply To Email</label>
              <input
                type="email"
                id="reply_to"
                name="reply_to"
                value={emailConfig.reply_to}
                onChange={handleInputChange}
                placeholder="support@osta.gov"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bounce_email">Bounce Email</label>
              <input
                type="email"
                id="bounce_email"
                name="bounce_email"
                value={emailConfig.bounce_email}
                onChange={handleInputChange}
                placeholder="bounce@osta.gov"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            <i className="fas fa-save"></i>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button 
            type="button" 
            onClick={testConnection} 
            className="btn btn-secondary"
            disabled={testing}
          >
            <i className="fas fa-plug"></i>
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-envelope"></i> Email Templates</h3>
          <p>Customize email templates for different system notifications</p>
        </div>

        <div className="templates-grid">
          {templateTypes.map((template) => (
            <div key={template.key} className="template-card">
              <div className="template-header">
                <h4>{template.label}</h4>
                <p>{template.description}</p>
                <div className="template-actions">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-secondary"
                    onClick={() => previewTemplate(template.key)}
                  >
                    <i className="fas fa-eye"></i> Preview
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor={`template_${template.key}`}>Template Content</label>
                <textarea
                  id={`template_${template.key}`}
                  value={emailTemplates[template.key] || ''}
                  onChange={(e) => handleTemplateChange(template.key, e.target.value)}
                  placeholder={`Enter ${template.label.toLowerCase()} template...`}
                  rows={6}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={saveEmailTemplates}
            className="btn btn-primary" 
            disabled={saving}
          >
            <i className="fas fa-save"></i>
            {saving ? 'Saving...' : 'Save Templates'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderTestingTab = () => (
    <div className="tab-content">
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-paper-plane"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.sent_today}</h3>
            <p>Emails Sent Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon error">
            <i className="fas fa-times-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.failed_today}</h3>
            <p>Failed Today</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.queue_size}</h3>
            <p>Queued Emails</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{emailStats.last_sent ? new Date(emailStats.last_sent).toLocaleString() : 'Never'}</h3>
            <p>Last Email Sent</p>
          </div>
        </div>
      </div>

      <div className="testing-section">
        <div className="form-section">
          <div className="section-header">
            <h3><i className="fas fa-flask"></i> Connection Testing</h3>
            <p>Test your SMTP connection and email delivery</p>
          </div>

          {connectionStatus && (
            <div className={`alert ${connectionStatus.success ? 'alert-success' : 'alert-error'}`}>
              <i className={`fas ${connectionStatus.success ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              {connectionStatus.message}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="test_email">Test Email Address</label>
              <input
                type="email"
                id="test_email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={testConnection}
              className="btn btn-secondary" 
              disabled={testing}
            >
              <i className="fas fa-plug"></i>
              {testing ? 'Testing Connection...' : 'Test SMTP Connection'}
            </button>
            <button 
              type="button" 
              onClick={sendTestEmail}
              className="btn btn-primary" 
              disabled={testing || !testEmail}
            >
              <i className="fas fa-paper-plane"></i>
              {testing ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3><i className="fas fa-tools"></i> Queue Management</h3>
            <p>Manage email queue and delivery monitoring</p>
          </div>

          <div className="queue-actions">
            <button 
              type="button" 
              onClick={clearEmailQueue}
              className="btn btn-danger"
            >
              <i className="fas fa-trash"></i>
              Clear Email Queue
            </button>
            <button 
              type="button" 
              onClick={fetchEmailStats}
              className="btn btn-secondary"
            >
              <i className="fas fa-sync"></i>
              Refresh Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-cogs"></i> Advanced Settings</h3>
          <p>Configure advanced email delivery and monitoring options</p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="max_send_rate">Max Send Rate (per hour)</label>
            <input
              type="number"
              id="max_send_rate"
              name="max_send_rate"
              value={emailConfig.max_send_rate}
              onChange={handleInputChange}
              min="1"
              max="1000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="daily_limit">Daily Send Limit</label>
            <input
              type="number"
              id="daily_limit"
              name="daily_limit"
              value={emailConfig.daily_limit}
              onChange={handleInputChange}
              min="1"
              max="10000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="retry_attempts">Retry Attempts</label>
            <input
              type="number"
              id="retry_attempts"
              name="retry_attempts"
              value={emailConfig.retry_attempts}
              onChange={handleInputChange}
              min="0"
              max="10"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="enable_logging"
                checked={emailConfig.enable_logging}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Enable Email Logging
            </label>
            <p className="help-text">Log all email activities for monitoring and debugging</p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={saveEmailConfig}
            className="btn btn-primary" 
            disabled={saving}
          >
            <i className="fas fa-save"></i>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2><i className="fas fa-envelope-open-text"></i> Email Setup</h2>
            <p>Configure SMTP settings and manage email templates</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      <div className="admin-tabs">
        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content-wrapper">
          {activeTab === 'smtp' && renderSMTPTab()}
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'testing' && renderTestingTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
};

export default SetupEmail;
