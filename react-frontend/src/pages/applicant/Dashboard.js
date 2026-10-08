import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import '../../styles/ApplicantComponents.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    interviewsScheduled: 0,
    profileViews: 0,
    profileCompleteness: 0,
    activeApplications: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch comprehensive applicant data
      const [
        statsResponse, 
        applicationsResponse, 
        recommendedResponse, 
        activityResponse,
        interviewsResponse
      ] = await Promise.all([
        apiService.getApplicantStats({ period: timeFilter }),
        apiService.getApplicantApplications({ limit: 5, sort: 'applied_at', order: 'desc' }),
        apiService.getRecommendedJobs({ limit: 6 }),
        apiService.getApplicantActivity({ limit: 10 }),
        apiService.getUpcomingInterviews({ limit: 3 })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (applicationsResponse.success) {
        setRecentApplications(applicationsResponse.data);
      }

      if (recommendedResponse.success) {
        setRecommendedJobs(recommendedResponse.data);
      }

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data || []);
      }

      if (interviewsResponse.success) {
        setUpcomingInterviews(interviewsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const getProfileCompletenessColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'danger';
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

  return (
    <div className="applicant-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="dashboard-title">
              <i className="fas fa-tachometer-alt me-3"></i>
              Welcome back, {user?.full_name}!
            </h1>
            <p className="dashboard-subtitle">
              Track your applications, discover opportunities, and advance your career
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
            <Link to="/browse-jobs" className="btn btn-primary btn-lg">
              <i className="fas fa-search me-2"></i>
              Browse Jobs
            </Link>
          </div>
        </div>

        {/* Profile Completeness Alert */}
        {stats.profileCompleteness < 80 && (
          <div className="profile-alert">
            <div className="alert-content">
              <div className="alert-icon">
                <i className="fas fa-user-edit"></i>
              </div>
              <div className="alert-text">
                <h4>Complete Your Profile</h4>
                <p>Your profile is {stats.profileCompleteness}% complete. A complete profile gets 3x more views!</p>
              </div>
              <div className="alert-progress">
                <div className="progress">
                  <div 
                    className={`progress-bar bg-${getProfileCompletenessColor(stats.profileCompleteness)}`}
                    style={{ width: `${stats.profileCompleteness}%` }}
                  ></div>
                </div>
                <Link to="/applicant/profile" className="btn btn-outline-primary btn-sm">
                  Complete Profile
                </Link>
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
            <h3>{stats.appliedJobs}</h3>
            <p>Applied Jobs</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +5 this week
            </span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fas fa-bookmark"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.savedJobs}</h3>
            <p>Saved Jobs</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +2 this week
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
              <i className="fas fa-arrow-up"></i> +1 this week
            </span>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="fas fa-eye"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.profileViews}</h3>
            <p>Profile Views</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +12 this week
            </span>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.activeApplications}</h3>
            <p>Active Applications</p>
            <span className="stat-trend neutral">
              <i className="fas fa-minus"></i> No change
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-grid">
          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div className="dashboard-section urgent">
              <div className="section-header">
                <h2>
                  <i className="fas fa-calendar-alt me-2"></i>
                  Upcoming Interviews
                </h2>
                <Link to="/applicant/interviews" className="view-all-link">
                  View All <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
              
              <div className="interviews-list">
                {upcomingInterviews.map((interview) => (
                  <div key={interview.id} className="interview-card">
                    <div className="interview-date">
                      <div className="date-day">{new Date(interview.scheduled_at).getDate()}</div>
                      <div className="date-month">{new Date(interview.scheduled_at).toLocaleDateString('en-US', { month: 'short' })}</div>
                    </div>
                    <div className="interview-info">
                      <h4>{interview.job_title}</h4>
                      <p>{interview.company_name}</p>
                      <div className="interview-meta">
                        <span className="interview-time">
                          <i className="fas fa-clock"></i>
                          {formatDateTime(interview.scheduled_at)}
                        </span>
                        <span className="interview-type">
                          <i className="fas fa-video"></i>
                          {interview.type}
                        </span>
                      </div>
                    </div>
                    <div className="interview-actions">
                      <Link 
                        to={`/applicant/interviews/${interview.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="fas fa-info-circle"></i>
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Applications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-file-alt me-2"></i>
                Recent Applications
              </h2>
              <Link to="/applicant/applications" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            <div className="applications-list">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="company-logo">
                      <img 
                        src={application.company_logo || '/default-company.png'} 
                        alt={application.company_name}
                        onError={(e) => {
                          e.target.src = '/default-company.png';
                        }}
                      />
                    </div>
                    <div className="application-info">
                      <h4 className="job-title">{application.job_title}</h4>
                      <p className="company-name">{application.company_name}</p>
                      <div className="application-meta">
                        <span className="applied-date">
                          <i className="fas fa-calendar"></i>
                          Applied {formatDate(application.applied_at)}
                        </span>
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <div className="application-actions">
                      <Link 
                        to={`/applicant/applications/${application.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <i className="fas fa-eye"></i>
                        View
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-file-alt"></i>
                  <h4>No applications yet</h4>
                  <p>Start applying to jobs to track your progress here</p>
                  <Link to="/browse-jobs" className="btn btn-primary">
                    <i className="fas fa-search"></i>
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <i className="fas fa-star me-2"></i>
                Recommended for You
              </h2>
              <Link to="/browse-jobs?recommended=true" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            <div className="jobs-grid">
              {recommendedJobs.length > 0 ? (
                recommendedJobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <h4 className="job-title">{job.title}</h4>
                      <button 
                        className="save-job-btn"
                        onClick={() => {/* Handle save job */}}
                      >
                        <i className="far fa-bookmark"></i>
                      </button>
                    </div>
                    <p className="company-name">{job.company_name}</p>
                    <div className="job-details">
                      <span className="job-detail">
                        <i className="fas fa-map-marker-alt"></i>
                        {job.location}
                      </span>
                      <span className="job-detail">
                        <i className="fas fa-building"></i>
                        {job.department_name}
                      </span>
                      {job.salary_min && job.salary_max && (
                        <span className="job-detail">
                          <i className="fas fa-dollar-sign"></i>
                          ${job.salary_min}k - ${job.salary_max}k
                        </span>
                      )}
                    </div>
                    <div className="job-tags">
                      <span className="job-tag">{job.employment_type}</span>
                      {job.remote_work && <span className="job-tag remote">Remote</span>}
                      {job.urgent && <span className="job-tag urgent">Urgent</span>}
                    </div>
                    <div className="job-actions">
                      <Link 
                        to={`/jobs/${job.id}`}
                        className="btn btn-sm btn-outline-primary"
                      >
                        View Details
                      </Link>
                      <Link 
                        to={`/jobs/${job.id}/apply`}
                        className="btn btn-sm btn-primary"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fas fa-star"></i>
                  <h4>No recommendations yet</h4>
                  <p>Complete your profile to get personalized job recommendations</p>
                  <Link to="/applicant/profile" className="btn btn-primary">
                    <i className="fas fa-user-edit"></i>
                    Complete Profile
                  </Link>
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
            <Link to="/browse-jobs" className="action-card primary">
              <div className="action-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>Browse Jobs</h3>
              <p>Discover new opportunities that match your skills</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/applicant/profile" className="action-card success">
              <div className="action-icon">
                <i className="fas fa-user-edit"></i>
              </div>
              <h3>Update Profile</h3>
              <p>Keep your profile current to attract employers</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/applicant/saved-jobs" className="action-card info">
              <div className="action-icon">
                <i className="fas fa-bookmark"></i>
              </div>
              <h3>Saved Jobs</h3>
              <p>Review and apply to your bookmarked positions</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/applicant/applications" className="action-card warning">
              <div className="action-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>My Applications</h3>
              <p>Track the status of your job applications</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/applicant/interviews" className="action-card secondary">
              <div className="action-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Interviews</h3>
              <p>Manage your interview schedule and preparation</p>
              <span className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </span>
            </Link>

            <Link to="/applicant/job-alerts" className="action-card dark">
              <div className="action-icon">
                <i className="fas fa-bell"></i>
              </div>
              <h3>Job Alerts</h3>
              <p>Set up notifications for relevant job postings</p>
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

export default Dashboard;
