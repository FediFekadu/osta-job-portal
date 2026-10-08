import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const Alerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [newAlert, setNewAlert] = useState({
    keywords: '',
    location: '',
    department_id: '',
    employment_type: '',
    salary_min: ''
  });

  useEffect(() => {
    fetchAlerts();
    fetchDepartments();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await apiService.get('/api/applicant/job-alerts.php');
      if (response.data.success) {
        setAlerts(response.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.get('/api/departments.php');
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.post('/api/applicant/job-alerts.php', newAlert);
      if (response.data.success) {
        fetchAlerts();
        setShowCreateModal(false);
        setNewAlert({
          keywords: '',
          location: '',
          department_id: '',
          employment_type: '',
          salary_min: ''
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const toggleAlert = async (alertId, isActive) => {
    try {
      await apiService.put('/api/applicant/job-alerts.php', {
        alert_id: alertId,
        is_active: !isActive
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await apiService.delete(`/api/applicant/job-alerts.php?id=${alertId}`);
        fetchAlerts();
      } catch (error) {
        console.error('Error deleting alert:', error);
      }
    }
  };

  return (
    <div className="applicant-alerts">
      <div className="page-header">
        <h1><i className="fas fa-bell"></i> Job Alerts</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-create-alert"
        >
          <i className="fas fa-plus"></i> Create New Alert
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading alerts...</div>
      ) : (
        <div className="alerts-list">
          {alerts.length === 0 ? (
            <div className="no-alerts">
              <i className="fas fa-bell-slash"></i>
              <h3>No Job Alerts</h3>
              <p>Create your first job alert to get notified about relevant opportunities.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn-create-first"
              >
                Create Job Alert
              </button>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="alert-card">
                <div className="alert-header">
                  <h3>{alert.keywords || 'Any Keywords'}</h3>
                  <div className="alert-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={alert.is_active}
                        onChange={() => toggleAlert(alert.id, alert.is_active)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                
                <div className="alert-details">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{alert.location || 'Any Location'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{alert.department_name || 'Any Department'}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{alert.employment_type || 'Any Type'}</span>
                  </div>
                  {alert.salary_min && (
                    <div className="detail-item">
                      <i className="fas fa-dollar-sign"></i>
                      <span>Min: ${alert.salary_min}</span>
                    </div>
                  )}
                </div>
                
                <div className="alert-meta">
                  <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                  <button 
                    onClick={() => deleteAlert(alert.id)}
                    className="btn-delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Job Alert</h2>
              <button onClick={() => setShowCreateModal(false)} className="btn-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={createAlert} className="alert-form">
              <div className="form-group">
                <label>Keywords</label>
                <input
                  type="text"
                  value={newAlert.keywords}
                  onChange={(e) => setNewAlert({...newAlert, keywords: e.target.value})}
                  placeholder="e.g., developer, manager, analyst"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newAlert.location}
                  onChange={(e) => setNewAlert({...newAlert, location: e.target.value})}
                  placeholder="e.g., New York, Remote"
                />
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={newAlert.department_id}
                  onChange={(e) => setNewAlert({...newAlert, department_id: e.target.value})}
                >
                  <option value="">Any Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Employment Type</label>
                <select
                  value={newAlert.employment_type}
                  onChange={(e) => setNewAlert({...newAlert, employment_type: e.target.value})}
                >
                  <option value="">Any Type</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label>Minimum Salary</label>
                <input
                  type="number"
                  value={newAlert.salary_min}
                  onChange={(e) => setNewAlert({...newAlert, salary_min: e.target.value})}
                  placeholder="e.g., 50000"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-create">
                  Create Alert
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
