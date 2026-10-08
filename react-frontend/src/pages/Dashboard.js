import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import ApplicationsTable from '../components/ApplicationsTable';
import JobApplicationForm from '../components/JobApplicationForm';
import { apiService } from '../services/apiService';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalApplied: 0,
    pending: 0,
    shortlisted: 0,
    savedJobs: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [pendingJob, setPendingJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    checkPendingApplication();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [userResponse, applicationsResponse] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getApplications()
      ]);

      setUser(userResponse.data);
      setRecentApplications(applicationsResponse.data.slice(0, 5));
      
      // Calculate stats
      const applications = applicationsResponse.data;
      const statsData = {
        totalApplied: applications.length,
        pending: applications.filter(app => app.status === 'pending').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        savedJobs: 0 // Will be fetched separately
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPendingApplication = async () => {
    try {
      const response = await apiService.getPendingJobApplication();
      if (response.data && response.data.job) {
        setPendingJob(response.data.job);
        setShowApplicationForm(true);
      }
    } catch (error) {
      console.error('Error checking pending application:', error);
    }
  };

  const handleApplicationSubmit = async (formData) => {
    try {
      await apiService.submitJobApplication(formData);
      setShowApplicationForm(false);
      setPendingJob(null);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  };

  const handleCancelApplication = () => {
    setShowApplicationForm(false);
    setPendingJob(null);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Header user={user} />
        
        {showApplicationForm && pendingJob && (
          <JobApplicationForm
            job={pendingJob}
            onSubmit={handleApplicationSubmit}
            onCancel={handleCancelApplication}
          />
        )}

        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Welcome back, {user?.name || 'User'}!</h1>
            <p className="dashboard-subtitle">Here's your job search overview</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              title="Total Applied"
              value={stats.totalApplied}
              icon="fas fa-paper-plane"
              color="primary"
            />
            <StatsCard
              title="Pending"
              value={stats.pending}
              icon="fas fa-clock"
              color="warning"
            />
            <StatsCard
              title="Shortlisted"
              value={stats.shortlisted}
              icon="fas fa-star"
              color="success"
            />
            <StatsCard
              title="Saved Jobs"
              value={stats.savedJobs}
              icon="fas fa-bookmark"
              color="info"
            />
          </div>

          {/* Recent Applications */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <a href="/applications" className="view-all-btn">
                View All <i className="fas fa-arrow-right"></i>
              </a>
            </div>
            <ApplicationsTable applications={recentApplications} />
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="quick-actions">
              <a href="/jobs" className="action-card">
                <i className="fas fa-search"></i>
                <h3>Browse Jobs</h3>
                <p>Find your next opportunity</p>
              </a>
              <a href="/saved-jobs" className="action-card">
                <i className="fas fa-bookmark"></i>
                <h3>Saved Jobs</h3>
                <p>Review your saved positions</p>
              </a>
              <a href="/profile" className="action-card">
                <i className="fas fa-user"></i>
                <h3>Update Profile</h3>
                <p>Keep your profile current</p>
              </a>
              <a href="/job-alerts" className="action-card">
                <i className="fas fa-bell"></i>
                <h3>Job Alerts</h3>
                <p>Manage your notifications</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
