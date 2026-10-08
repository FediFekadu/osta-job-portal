import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiService } from '../services/apiService';
import '../../styles/ApplicantComponents.css';
const JobAlerts = () => {
  const [user, setUser] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    keywords: '',
    location: '',
    job_type: '',
    salary_min: '',
    frequency: 'daily'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, alertsResponse] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getJobAlerts()
      ]);
      
      setUser(userResponse.data);
      setAlerts(alertsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      await apiService.createJobAlert(formData);
      setShowCreateForm(false);
      setFormData({
        keywords: '',
        location: '',
        job_type: '',
        salary_min: '',
        frequency: 'daily'
      });
      fetchData(); // Refresh alerts
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await apiService.deleteJobAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading job alerts...</p>
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
            <div>
              <h1 className="page-title">Job Alerts</h1>
              <p className="page-subtitle">Get notified about new job opportunities</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateForm(true)}
            >
              <i className="fas fa-plus"></i>
              Create Alert
            </button>
          </div>

          {showCreateForm && (
            <div className="content-card mb-4">
              <div className="card-header">
                <h3>Create New Job Alert</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowCreateForm(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="alert-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="keywords">Keywords</label>
                    <input
                      type="text"
                      id="keywords"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="e.g. React Developer, Marketing"
                      className="form-input"
                      required
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
                      placeholder="e.g. New York, Remote"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="job_type">Job Type</label>
                    <select
                      id="job_type"
                      name="job_type"
                      value={formData.job_type}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Any</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="salary_min">Minimum Salary</label>
                    <input
                      type="number"
                      id="salary_min"
                      name="salary_min"
                      value={formData.salary_min}
                      onChange={handleInputChange}
                      placeholder="50000"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="frequency">Notification Frequency</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-bell"></i>
                    Create Alert
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="content-card">
            {alerts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-bell-slash"></i>
                <h3>No Job Alerts</h3>
                <p>Create your first job alert to get notified about new opportunities.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Alert
                </button>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map((alert) => (
                  <div key={alert.id} className="alert-card">
                    <div className="alert-header">
                      <div className="alert-info">
                        <h4>{alert.keywords}</h4>
                        <div className="alert-meta">
                          {alert.location && (
                            <span className="alert-location">
                              <i className="fas fa-map-marker-alt"></i>
                              {alert.location}
                            </span>
                          )}
                          {alert.job_type && (
                            <span className="alert-type">
                              <i className="fas fa-briefcase"></i>
                              {alert.job_type}
                            </span>
                          )}
                          {alert.salary_min && (
                            <span className="alert-salary">
                              <i className="fas fa-dollar-sign"></i>
                              ${alert.salary_min}+
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="alert-actions">
                        <span className={`alert-status ${alert.active ? 'active' : 'inactive'}`}>
                          {alert.active ? 'Active' : 'Inactive'}
                        </span>
                        <button 
                          className="btn-icon"
                          onClick={() => handleDeleteAlert(alert.id)}
                          title="Delete Alert"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="alert-footer">
                      <span className="alert-frequency">
                        <i className="fas fa-clock"></i>
                        {alert.frequency} notifications
                      </span>
                      <span className="alert-created">
                        Created: {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAlerts;
