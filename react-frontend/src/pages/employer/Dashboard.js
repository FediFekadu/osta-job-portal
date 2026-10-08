import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import '../../styles/EmployerComponents.css';

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pendingReviews: 0,
    hiredCandidates: 0,
    interviewsScheduled: 0,
    departmentJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [departmentInfo, setDepartmentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use improved API methods for better data fetching
      const [statsResponse, jobsResponse, applicationsResponse, activityResponse, departmentResponse] = await Promise.all([
        apiService.getEmployerDashboardData(),
        apiService.getEmployerJobs({ limit: 5, sort: 'created_at', order: 'desc' }),
        apiService.getEmployerRecentApplications(5),
        apiService.getEmployerActivity({ limit: 10 }),
        apiService.getEmployerDepartment()
      ]);

      // Safely extract data with fallbacks
      const statsData = statsResponse?.data || statsResponse || {};
      const jobsData = Array.isArray(jobsResponse?.data) ? jobsResponse.data : 
                      Array.isArray(jobsResponse) ? jobsResponse : [];
      const applicationsData = Array.isArray(applicationsResponse?.data) ? applicationsResponse.data : 
                              Array.isArray(applicationsResponse) ? applicationsResponse : [];
      const activityData = activityResponse?.data || activityResponse || [];
      const departmentData = departmentResponse?.data || departmentResponse || {};

      setStats({
        activeJobs: statsData.activeJobs || 0,
        totalApplications: statsData.totalApplications || 0,
        pendingReviews: statsData.pendingReviews || 0,
        hiredCandidates: statsData.hiredCandidates || 0,
        interviewsScheduled: statsData.interviewsScheduled || 0,
        departmentJobs: statsData.departmentJobs || 0
      });
      
      setRecentJobs(jobsData);
      setRecentApplications(applicationsData);
      setRecentActivity(activityData);
      setDepartmentInfo(departmentData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'reviewing': 'info',
      'shortlisted': 'primary',
      'interviewed': 'secondary',
      'hired': 'success',
      'rejected': 'danger'
    };
    return colors[status] || 'secondary';
  };

  const getJobStatusColor = (status) => {
    const colors = {
      'active': 'success',
      'draft': 'warning',
      'closed': 'secondary',
      'expired': 'danger'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              <i className="fas fa-tachometer-alt me-3"></i>
              Employer Dashboard
            </h1>
            <p className="dashboard-subtitle">
              Welcome back! Manage your job postings and track applications from {departmentInfo?.name || 'your department'}
            </p>
          </div>
          <div className="header-actions">
            <div className="time-filter">
              <select 
                value={timeFilter} 
                onChange={(e) => setTimeFilter(e.target.value)}
                className="form-select"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <Link to="/employer/post-job" className="btn btn-primary btn-lg">
              <i className="fas fa-plus me-2"></i>
              Post New Job
            </Link>
          </div>
        </div>
        
        {/* Department Info Card */}
        {departmentInfo && (
          <div className="department-info-card">
            <div className="department-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="department-details">
              <h3>{departmentInfo.name}</h3>
              <p>{departmentInfo.description}</p>
              <div className="department-stats">
                <span className="stat-item">
                  <i className="fas fa-briefcase"></i>
                  {stats.departmentJobs} Active Jobs
                </span>
                <span className="stat-item">
                  <i className="fas fa-users"></i>
                  {departmentInfo.total_employees} Employees
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="fas fa-briefcase"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +12%
            </span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalApplications}</h3>
            <p>Total Applications</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +8%
            </span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingReviews}</h3>
            <p>Pending Reviews</p>
            <span className="stat-trend neutral">
              <i className="fas fa-minus"></i> 0%
            </span>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.interviewsScheduled}</h3>
            <p>Interviews Scheduled</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +15%
            </span>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.hiredCandidates}</h3>
            <p>Hired Candidates</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +25%
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-grid">
          {/* Recent Jobs Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-briefcase me-2"></i>
                Recent Job Postings
              </h2>
              <Link to="/employer/manage-jobs" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            <div className="jobs-list">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h4 className="job-title">{job.title}</h4>
                      <span className={`status-badge ${getJobStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="job-details">
                      <span className="job-detail">
                        <i className="fas fa-building"></i>
                        {job.department_name}
                      </span>
                      <span className="job-detail">
                        <i className="fas fa-map-marker-alt"></i>
                        {job.location}
                      </span>
                      <span className="job-detail">
                        <i className="fas fa-calendar"></i>
                        {formatDate(job.created_at)}
                      </span>
                    </div>
                    <div className="job-stats">
                      <span className="stat">
                        <i className="fas fa-eye"></i>
                        {job.views || 0} views
                      </span>
                      <span className="stat">
                        <i className="fas fa-file-alt"></i>
                        {job.applications_count || 0} applications
                      </span>
                    </div>
                    <div className="job-actions">
                      <Link 
                        to={`/employer/jobs/${job.id}/edit`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </Link>
                      <Link 
                        to={`/employer/jobs/${job.id}/applications`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="fas fa-users"></i>
                        Applications
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-briefcase"></i>
                  <h4>No jobs posted yet</h4>
                  <p>Start by posting your first job to attract candidates</p>
                  <Link to="/employer/post-job" className="btn btn-primary">
                    <i className="fas fa-plus"></i>
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-file-alt me-2"></i>
                Recent Applications
              </h2>
              <Link to="/employer/applications" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            <div className="applications-list">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="applicant-avatar">
                      <img 
                        src={application.applicant_avatar || '/default-avatar.png'} 
                        alt={application.applicant_name}
                        onError={(e) => {
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <div className="application-info">
                      <h4 className="applicant-name">{application.applicant_name}</h4>
                      <p className="job-title">{application.job_title}</p>
                      <div className="application-meta">
                        <span className="applied-date">
                          <i className="fas fa-clock"></i>
                          Applied {formatDateTime(application.applied_at)}
                        </span>
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <div className="application-actions">
                      <Link 
                        to={`/employer/applications/${application.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="fas fa-eye"></i>
                        Review
                      </Link>
                      {application.cv_file && (
                        <a 
                          href={`/uploads/cvs/${application.cv_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-secondary"
                        >
                          <i className="fas fa-download"></i>
                          CV
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-file-alt"></i>
                  <h4>No applications yet</h4>
                  <p>Applications will appear here once candidates start applying</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h2>
              <i className="fas fa-history me-2"></i>
              Recent Activity
            </h2>
          </div>
          
          <div className="activity-feed">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    <i className={`fas ${activity.icon || 'fa-circle'}`}></i>
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.description}</p>
                    <span className="activity-time">{formatDateTime(activity.created_at)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="fas fa-history"></i>
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="quick-actions">
          <h2>
            <i className="fas fa-bolt me-2"></i>
            Quick Actions
          </h2>
          <div className="quick-actions-grid">
            <Link to="/employer/post-job" className="action-card primary">
              <div className="action-icon">
                <i className="fas fa-plus-circle"></i>
              </div>
              <h3>Post New Job</h3>
              <p>Create a new job posting for your department</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/employer/applications" className="action-card success">
              <div className="action-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>Review Applications</h3>
              <p>Manage and review pending applications</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/employer/interviews" className="action-card info">
              <div className="action-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Schedule Interviews</h3>
              <p>Manage interview schedules and communications</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/employer/reports" className="action-card warning">
              <div className="action-icon">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>View Reports</h3>
              <p>Analyze hiring metrics and performance</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/employer/candidates" className="action-card secondary">
              <div className="action-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Candidate Database</h3>
              <p>Browse and search candidate profiles</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/employer/profile" className="action-card dark">
              <div className="action-icon">
                <i className="fas fa-building"></i>
              </div>
              <h3>Company Profile</h3>
              <p>Update company and department information</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;