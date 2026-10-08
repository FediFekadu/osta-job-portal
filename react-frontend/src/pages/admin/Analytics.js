import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import '../../styles/AdminComponents.css';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    end_date: new Date().toISOString().split('T')[0] // Today
  });
  const [selectedMetrics, setSelectedMetrics] = useState(['users', 'jobs', 'applications']);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  useEffect(() => {
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAnalytics(true);
    }, 5 * 60 * 1000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [dateRange]);

  const fetchAnalytics = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
        setError('');
      }
      
      const response = await apiService.getAnalytics(dateRange);
      
      if (response?.data?.success) {
        setAnalyticsData(response.data.data);
        setLastUpdated(new Date());
        if (!isAutoRefresh) {
          setSuccess('Analytics data loaded successfully');
          setTimeout(() => setSuccess(''), 3000);
        }
      } else {
        throw new Error('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
      setAnalyticsData(null);
      setTimeout(() => setError(''), 5000);
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const exportData = async (format) => {
    try {
      const exportData = {
        date_range: dateRange,
        analytics: analyticsData,
        exported_at: new Date().toISOString()
      };

      const dataStr = format === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : convertToCSV(exportData);
      
      const dataBlob = new Blob([dataStr], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${dateRange.start_date}_to_${dateRange.end_date}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      setSuccess(`Analytics data exported as ${format.toUpperCase()}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
      setTimeout(() => setError(''), 3000);
    }
  };

  const convertToCSV = (data) => {
    const headers = ['Metric', 'Value', 'Type'];
    const rows = [];
    
    if (data.analytics?.summary) {
      Object.entries(data.analytics.summary).forEach(([key, value]) => {
        rows.push([key.replace(/_/g, ' ').toUpperCase(), value, 'Summary']);
      });
    }
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const formatPercentage = (current, previous) => {
    if (!previous || previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  const getChangeColor = (current, previous) => {
    if (!previous || previous === 0) return '';
    const change = current - previous;
    return change >= 0 ? 'positive' : 'negative';
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-chart-line"></i>
          Analytics Dashboard
        </h1>
        <p className="admin-page-subtitle">Comprehensive system analytics and insights</p>
        {lastUpdated && (
          <div className="admin-last-updated">
            <i className="fas fa-clock"></i>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="admin-alert admin-alert-danger">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="admin-alert admin-alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Controls */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-filter"></i>
            Analytics Controls
          </h2>
          <div className="admin-card-actions">
            <button
              className="admin-btn admin-btn-primary admin-btn-sm"
              onClick={() => fetchAnalytics()}
            >
              <i className="fas fa-sync-alt"></i>
              Refresh Data
            </button>
          </div>
        </div>
        <div className="admin-card-body">
          <div className="admin-analytics-controls">
            <div className="admin-date-range-controls">
              <div className="admin-form-group">
                <label className="admin-form-label">Start Date</label>
                <input
                  type="date"
                  className="admin-form-control"
                  value={dateRange.start_date}
                  onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">End Date</label>
                <input
                  type="date"
                  className="admin-form-control"
                  value={dateRange.end_date}
                  onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                />
              </div>
            </div>
            
            <div className="admin-metric-selection">
              <label className="admin-form-label">Display Metrics</label>
              <div className="admin-checkbox-group">
                {['users', 'jobs', 'applications', 'departments'].map(metric => (
                  <label key={metric} className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={() => handleMetricToggle(metric)}
                    />
                    <span>{metric.charAt(0).toUpperCase() + metric.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="admin-export-controls">
              <label className="admin-form-label">Export Data</label>
              <div className="admin-btn-group">
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => exportData('csv')}
                >
                  <i className="fas fa-file-csv"></i>
                  Export CSV
                </button>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  onClick={() => exportData('json')}
                >
                  <i className="fas fa-file-code"></i>
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {analyticsData && (
        <>
          {/* Summary Statistics */}
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Total Users</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-users"></i>
                </div>
              </div>
              <div className="admin-stat-value">
                {formatNumber(analyticsData.summary?.total_users)}
              </div>
              <div className="admin-stat-change positive">
                <i className="fas fa-arrow-up"></i>
                +{formatNumber(analyticsData.user_stats?.new_users || 0)} this period
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Active Jobs</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
              </div>
              <div className="admin-stat-value">
                {formatNumber(analyticsData.summary?.active_jobs)}
              </div>
              <div className="admin-stat-change positive">
                <i className="fas fa-arrow-up"></i>
                +{formatNumber(analyticsData.job_stats?.new_jobs || 0)} this period
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Total Applications</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-paper-plane"></i>
                </div>
              </div>
              <div className="admin-stat-value">
                {formatNumber(analyticsData.summary?.total_applications)}
              </div>
              <div className="admin-stat-change positive">
                <i className="fas fa-arrow-up"></i>
                +{formatNumber(analyticsData.application_stats?.new_applications || 0)} this period
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Pending Applications</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-clock"></i>
                </div>
              </div>
              <div className="admin-stat-value">
                {formatNumber(analyticsData.summary?.pending_applications)}
              </div>
              <div className="admin-stat-change warning">
                <i className="fas fa-exclamation-triangle"></i>
                Needs attention
              </div>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="admin-analytics-grid">
            {/* User Analytics */}
            {selectedMetrics.includes('users') && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <i className="fas fa-users"></i>
                    User Analytics
                  </h2>
                </div>
                <div className="admin-card-body">
                  <div className="admin-analytics-breakdown">
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Applicants</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.user_stats?.applicants)}
                      </span>
                    </div>
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Employers</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.user_stats?.employers)}
                      </span>
                    </div>
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Active Users</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.user_stats?.active_users)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="admin-chart-placeholder">
                    <i className="fas fa-chart-bar"></i>
                    <p>User Growth Chart</p>
                    <small>Chart visualization will be implemented here</small>
                  </div>
                </div>
              </div>
            )}

            {/* Job Analytics */}
            {selectedMetrics.includes('jobs') && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <i className="fas fa-briefcase"></i>
                    Job Analytics
                  </h2>
                </div>
                <div className="admin-card-body">
                  <div className="admin-analytics-breakdown">
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Active Jobs</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.job_stats?.active_jobs)}
                      </span>
                    </div>
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Pending Jobs</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.job_stats?.pending_jobs)}
                      </span>
                    </div>
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">New Jobs</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.job_stats?.new_jobs)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="admin-chart-placeholder">
                    <i className="fas fa-chart-pie"></i>
                    <p>Job Status Distribution</p>
                    <small>Chart visualization will be implemented here</small>
                  </div>
                </div>
              </div>
            )}

            {/* Application Analytics */}
            {selectedMetrics.includes('applications') && (
              <div className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <i className="fas fa-paper-plane"></i>
                    Application Analytics
                  </h2>
                </div>
                <div className="admin-card-body">
                  <div className="admin-analytics-breakdown">
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Pending</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.application_stats?.pending_applications)}
                      </span>
                    </div>
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Approved</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.application_stats?.approved_applications)}
                      </span>
                    </div>
                    <div className="admin-breakdown-item">
                      <span className="admin-breakdown-label">Rejected</span>
                      <span className="admin-breakdown-value">
                        {formatNumber(analyticsData.application_stats?.rejected_applications)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="admin-chart-placeholder">
                    <i className="fas fa-chart-line"></i>
                    <p>Application Trends</p>
                    <small>Chart visualization will be implemented here</small>
                  </div>
                </div>
              </div>
            )}

            {/* Department Performance */}
            {selectedMetrics.includes('departments') && analyticsData.department_stats && (
              <div className="admin-card admin-card-full-width">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <i className="fas fa-sitemap"></i>
                    Department Performance
                  </h2>
                </div>
                <div className="admin-card-body">
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Jobs Posted</th>
                          <th>Applications</th>
                          <th>Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.department_stats.map((dept, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{dept.department_name}</strong>
                            </td>
                            <td>
                              <span className="admin-metric-value">
                                {formatNumber(dept.job_count)}
                              </span>
                            </td>
                            <td>
                              <span className="admin-metric-value">
                                {formatNumber(dept.application_count)}
                              </span>
                            </td>
                            <td>
                              <div className="admin-performance-bar">
                                <div 
                                  className="admin-performance-fill"
                                  style={{ 
                                    width: `${Math.min(100, (dept.application_count / Math.max(...analyticsData.department_stats.map(d => d.application_count))) * 100)}%` 
                                  }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <i className="fas fa-history"></i>
                Recent Activity
              </h2>
            </div>
            <div className="admin-card-body">
              {analyticsData.recent_activity && analyticsData.recent_activity.length > 0 ? (
                <div className="admin-activity-feed">
                  {analyticsData.recent_activity.slice(0, 10).map((activity, index) => (
                    <div key={index} className="admin-activity-item">
                      <div className={`admin-activity-icon admin-activity-${activity.type}`}>
                        <i className={`fas ${
                          activity.type === 'users' ? 'fa-user-plus' :
                          activity.type === 'jobs' ? 'fa-briefcase' :
                          'fa-paper-plane'
                        }`}></i>
                      </div>
                      <div className="admin-activity-content">
                        <span className="admin-activity-text">
                          {formatNumber(activity.count)} new {activity.type}
                        </span>
                        <span className="admin-activity-date">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <i className="fas fa-history"></i>
                  <h3>No Recent Activity</h3>
                  <p>Activity data will appear here as users interact with the system.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
