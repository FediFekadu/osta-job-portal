import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'normal',
    recipients: 'all',
    scheduled_at: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    high_priority: 0
  });

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: 'fas fa-info-circle', color: '#17a2b8' },
    { value: 'success', label: 'Success', icon: 'fas fa-check-circle', color: '#28a745' },
    { value: 'warning', label: 'Warning', icon: 'fas fa-exclamation-triangle', color: '#ffc107' },
    { value: 'error', label: 'Error', icon: 'fas fa-times-circle', color: '#dc3545' },
    { value: 'system', label: 'System', icon: 'fas fa-cog', color: '#6c757d' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#6c757d' },
    { value: 'normal', label: 'Normal', color: '#17a2b8' },
    { value: 'high', label: 'High', color: '#ffc107' },
    { value: 'urgent', label: 'Urgent', color: '#dc3545' }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(filter);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getNotificationStats();
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error fetching notification stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      fetchNotifications();
      fetchStats();
      setSuccess('Notification marked as read');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await apiService.deleteNotification(notificationId);
      fetchNotifications();
      fetchStats();
      setSuccess('Notification deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      setError('Please select notifications first');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedNotifications.length} notification(s)?`)) return;

    try {
      await apiService.bulkNotificationAction(action, selectedNotifications);
      setSelectedNotifications([]);
      fetchNotifications();
      fetchStats();
      setSuccess(`Bulk ${action} completed successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError(`Failed to ${action} notifications`);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(notifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (notificationId, checked) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    } else {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      await apiService.createNotification(newNotification);
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        priority: 'normal',
        recipients: 'all',
        scheduled_at: ''
      });
      fetchNotifications();
      fetchStats();
      setSuccess('Notification created successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating notification:', error);
      setError('Failed to create notification');
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : 'fas fa-info-circle';
  };

  const getTypeColor = (type) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.color : '#17a2b8';
  };

  const getPriorityColor = (priority) => {
    const priorityConfig = priorityLevels.find(p => p.value === priority);
    return priorityConfig ? priorityConfig.color : '#17a2b8';
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
          <i className="fas fa-bell"></i>
          Notifications
        </h1>
        <p className="admin-page-subtitle">Manage system notifications and announcements</p>
        <div className="admin-page-actions">
          <button
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Create Notification
          </button>
        </div>
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

      {/* Stats Cards */}
      <div className="admin-row admin-mb-4">
        <div className="admin-col-md-4">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-primary">
              <i className="fas fa-bell"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.total}</h3>
              <p>Total Notifications</p>
            </div>
          </div>
        </div>
        <div className="admin-col-md-4">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-warning">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.unread}</h3>
              <p>Unread Notifications</p>
            </div>
          </div>
        </div>
        <div className="admin-col-md-4">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-danger">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.high_priority}</h3>
              <p>High Priority</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="admin-card admin-mb-4">
        <div className="admin-card-body">
          <div className="admin-row admin-align-center">
            <div className="admin-col-md-6">
              <div className="admin-d-flex admin-gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="admin-form-control"
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="admin-col-md-6">
              <div className="admin-d-flex admin-justify-end admin-gap-2">
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => handleBulkAction('mark_read')}
                  disabled={selectedNotifications.length === 0}
                >
                  <i className="fas fa-check"></i>
                  Mark as Read
                </button>
                <button
                  className="admin-btn admin-btn-outline admin-btn-danger"
                  onClick={() => handleBulkAction('delete')}
                  disabled={selectedNotifications.length === 0}
                >
                  <i className="fas fa-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-d-flex admin-justify-between admin-align-center">
            <h3>Notifications ({notifications.length})</h3>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                className="admin-checkbox"
                checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="admin-ml-2">Select All</span>
            </label>
          </div>
        </div>
        <div className="admin-card-body admin-p-0">
          {notifications.length === 0 ? (
            <div className="admin-text-center admin-py-5">
              <i className="fas fa-bell-slash admin-text-muted" style={{fontSize: '3rem'}}></i>
              <p className="admin-text-muted admin-mt-3">No notifications found</p>
            </div>
          ) : (
            <div className="admin-notifications-list">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`admin-notification-item ${
                    notification.is_read ? 'read' : 'unread'
                  } ${selectedNotifications.includes(notification.id) ? 'selected' : ''}`}
                >
                  <div className="admin-notification-checkbox">
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => handleSelectNotification(notification.id, e.target.checked)}
                    />
                  </div>
                  <div className="admin-notification-icon">
                    <i
                      className={getTypeIcon(notification.type)}
                      style={{ color: getTypeColor(notification.type) }}
                    ></i>
                  </div>
                  <div className="admin-notification-content">
                    <div className="admin-d-flex admin-justify-between admin-align-start">
                      <h4 className="admin-notification-title">{notification.title}</h4>
                      <div className="admin-d-flex admin-gap-1">
                        {notification.priority && notification.priority !== 'normal' && (
                          <span
                            className="admin-badge"
                            style={{ backgroundColor: getPriorityColor(notification.priority) }}
                          >
                            {notification.priority.toUpperCase()}
                          </span>
                        )}
                        {!notification.is_read && (
                          <span className="admin-badge admin-badge-primary">NEW</span>
                        )}
                      </div>
                    </div>
                    <p className="admin-notification-message">{notification.message}</p>
                    <div className="admin-notification-meta">
                      <small className="admin-text-muted">
                        <i className="fas fa-clock"></i>
                        {new Date(notification.created_at).toLocaleString()}
                      </small>
                      {notification.scheduled_at && (
                        <small className="admin-text-muted admin-ml-3">
                          <i className="fas fa-calendar"></i>
                          Scheduled: {new Date(notification.scheduled_at).toLocaleString()}
                        </small>
                      )}
                    </div>
                  </div>
                  <div className="admin-notification-actions">
                    {!notification.is_read && (
                      <button
                        className="admin-btn admin-btn-sm admin-btn-outline"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                    <button
                      className="admin-btn admin-btn-sm admin-btn-outline admin-btn-danger"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Create New Notification</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={createNotification}>
              <div className="admin-modal-body">
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Title *</label>
                      <input
                        type="text"
                        className="admin-form-control"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Type</label>
                      <select
                        className="admin-form-control"
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                      >
                        {notificationTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="admin-row">
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Priority</label>
                      <select
                        className="admin-form-control"
                        value={newNotification.priority}
                        onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                      >
                        {priorityLevels.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="admin-col-md-6">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Recipients</label>
                      <select
                        className="admin-form-control"
                        value={newNotification.recipients}
                        onChange={(e) => setNewNotification({...newNotification, recipients: e.target.value})}
                      >
                        <option value="all">All Users</option>
                        <option value="admins">Admins Only</option>
                        <option value="employers">Employers Only</option>
                        <option value="applicants">Applicants Only</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Message *</label>
                  <textarea
                    className="admin-form-control"
                    rows="4"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Schedule For (Optional)</label>
                  <input
                    type="datetime-local"
                    className="admin-form-control"
                    value={newNotification.scheduled_at}
                    onChange={(e) => setNewNotification({...newNotification, scheduled_at: e.target.value})}
                  />
                  <small className="admin-text-muted">Leave empty to send immediately</small>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <i className="fas fa-paper-plane"></i>
                  {newNotification.scheduled_at ? 'Schedule' : 'Send'} Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
