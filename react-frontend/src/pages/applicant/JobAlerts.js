import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const JobAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    keywords: '',
    location: '',
    employment_type: '',
    department_id: '',
    frequency: 'daily'
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchJobAlerts();
    fetchDepartments();
  }, []);

  const fetchJobAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobAlerts();
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching job alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlert(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.createJobAlert(newAlert);
      if (response.success) {
        setAlerts(prev => [...prev, response.data]);
        setNewAlert({
          keywords: '',
          location: '',
          employment_type: '',
          department_id: '',
          frequency: 'daily'
        });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating job alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      const response = await apiService.deleteJobAlert(alertId);
      if (response.success) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error deleting job alert:', error);
    }
  };

  const handleToggleAlert = async (alertId, isActive) => {
    try {
      const response = await apiService.updateJobAlert(alertId, { is_active: !isActive });
      if (response.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, is_active: !isActive } : alert
        ));
      }
    } catch (error) {
      console.error('Error updating job alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading job alerts...</p>
      </div>
    );
  }

  return (
    <div className="job-alerts-container">
      <div className="job-alerts-header">
        <h1>Job Alerts</h1>
        <p>Get notified when new jobs match your criteria</p>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <i className="fas fa-plus me-2"></i>
          Create New Alert
        </button>
      </div>

      {showCreateForm && (
        <div className="create-alert-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Job Alert</h3>
              <button
                className="close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="alert-form">
              <div className="form-group">
                <label htmlFor="keywords">Keywords</label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={newAlert.keywords}
                  onChange={handleInputChange}
                  placeholder="e.g., Engineer, Manager, Developer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newAlert.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Addis Ababa, Oromia"
                />
              </div>

              <div className="form-group">
                <label htmlFor="employment_type">Employment Type</label>
                <select
                  id="employment_type"
                  name="employment_type"
                  value={newAlert.employment_type}
                  onChange={handleInputChange}
                >
                  <option value="">All Types</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department_id">Department</label>
                <select
                  id="department_id"
                  name="department_id"
                  value={newAlert.department_id}
                  onChange={handleInputChange}
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="frequency">Notification Frequency</label>
                <select
                  id="frequency"
                  name="frequency"
                  value={newAlert.frequency}
                  onChange={handleInputChange}
                >
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-bell me-2"></i>
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-card ${alert.is_active ? 'active' : 'inactive'}`}>
              <div className="alert-header">
                <div className="alert-info">
                  <h3>Job Alert #{alert.id}</h3>
                  <div className="alert-criteria">
                    {alert.keywords && (
                      <span className="criteria-tag">
                        <i className="fas fa-search"></i>
                        {alert.keywords}
                      </span>
                    )}
                    {alert.location && (
                      <span className="criteria-tag">
                        <i className="fas fa-map-marker-alt"></i>
                        {alert.location}
                      </span>
                    )}
                    {alert.employment_type && (
                      <span className="criteria-tag">
                        <i className="fas fa-briefcase"></i>
                        {alert.employment_type.replace('_', ' ')}
                      </span>
                    )}
                    {alert.department_name && (
                      <span className="criteria-tag">
                        <i className="fas fa-building"></i>
                        {alert.department_name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="alert-actions">
                  <button
                    className={`toggle-btn ${alert.is_active ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                    title={alert.is_active ? 'Deactivate alert' : 'Activate alert'}
                  >
                    <i className={`fas ${alert.is_active ? 'fa-bell' : 'fa-bell-slash'}`}></i>
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this job alert?')) {
                        handleDeleteAlert(alert.id);
                      }
                    }}
                    title="Delete alert"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div className="alert-meta">
                <div className="meta-item">
                  <i className="fas fa-clock"></i>
                  <span>Frequency: {alert.frequency}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-envelope"></i>
                  <span>Last sent: {alert.last_sent ? new Date(alert.last_sent).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>

              <div className="alert-status">
                <span className={`status-badge ${alert.is_active ? 'active' : 'inactive'}`}>
                  {alert.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-bell fa-3x"></i>
          <h3>No job alerts</h3>
          <p>Create your first job alert to get notified when new jobs match your criteria.</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Create Your First Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default JobAlerts;
