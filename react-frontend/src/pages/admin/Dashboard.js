import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import StatsCard from '../../components/StatsCard';
import RecentActivityTable from '../../components/RecentActivityTable';
import PendingApprovalsCard from '../../components/PendingApprovalsCard';
import { apiService } from '../../services/apiService';
import '../../styles/AdminComponents.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalDepartments: 0,
    pendingJobs: 0,
    pendingUsers: 0,
    recentApplications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState({
    jobs: [],
    users: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse, approvalsResponse] = await Promise.all([
        apiService.getAdminStats(),
        apiService.getRecentActivity(),
        apiService.getPendingApprovals()
      ]);

      // Ensure data is properly structured with fallbacks
      setStats(statsResponse?.data || {
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalDepartments: 0,
        pendingJobs: 0,
        pendingUsers: 0,
        recentApplications: 0
      });
      
      // Ensure activities is always an array
      setRecentActivity(Array.isArray(activityResponse?.data) ? activityResponse.data : []);
      
      // Ensure pending approvals has proper structure
      setPendingApprovals({
        jobs: Array.isArray(approvalsResponse?.data?.jobs) ? approvalsResponse.data.jobs : [],
        users: Array.isArray(approvalsResponse?.data?.users) ? approvalsResponse.data.users : []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set safe defaults on error
      setStats({
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalDepartments: 0,
        pendingJobs: 0,
        pendingUsers: 0,
        recentApplications: 0
      });
      setRecentActivity([]);
      setPendingApprovals({ jobs: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (type, id, action) => {
    try {
      await apiService.handleApproval(type, id, action);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error handling approval:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-tachometer-alt"></i>
          Dashboard
        </h1>
        <p className="admin-page-subtitle">System overview and management center</p>
      </div>

      {/* System Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Total Users</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-users"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalUsers}</div>
          <div className="admin-stat-change positive">
            <i className="fas fa-arrow-up"></i>
            +5% this month
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Active Jobs</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-briefcase"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalJobs}</div>
          <div className="admin-stat-change positive">
            <i className="fas fa-arrow-up"></i>
            +12% this month
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Applications</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-paper-plane"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalApplications}</div>
          <div className="admin-stat-change positive">
            <i className="fas fa-arrow-up"></i>
            +8% this week
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Departments</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-building"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.totalDepartments}</div>
          <div className="admin-stat-change positive">
            <i className="fas fa-arrow-up"></i>
            2 new this month
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="admin-card admin-mb-4">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-clock"></i>
            Pending Approvals
          </h2>
          <div className="admin-d-flex admin-gap-2">
            <span className="badge badge-warning">{stats.pendingJobs} Jobs</span>
            <span className="badge badge-info">{stats.pendingUsers} Users</span>
          </div>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-row">
            <PendingApprovalsCard
              title="Pending Job Posts"
              items={pendingApprovals.jobs}
              type="job"
              onApproval={handleApproval}
              emptyMessage="No jobs pending approval"
            />
            <PendingApprovalsCard
              title="Pending User Registrations"
              items={pendingApprovals.users}
              type="user"
              onApproval={handleApproval}
              emptyMessage="No users pending approval"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-card admin-mb-4">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-history"></i>
            Recent Activity
          </h2>
          <Link to="/admin/analytics" className="admin-btn admin-btn-secondary admin-btn-sm">
            View Analytics <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="admin-card-body">
          <div className="admin-table-container">
            <RecentActivityTable activities={recentActivity} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-bolt"></i>
            Quick Actions
          </h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Manage Users</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-user-plus"></i>
                </div>
              </div>
              <p className="admin-mb-3">Add, edit, or remove user accounts</p>
              <Link to="/admin/users" className="admin-btn admin-btn-primary admin-btn-sm">
                Manage Users
              </Link>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Create Employer</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-building"></i>
                </div>
              </div>
              <p className="admin-mb-3">Create new employer accounts</p>
              <Link to="/admin/create-employer" className="admin-btn admin-btn-success admin-btn-sm">
                Create Employer
              </Link>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Departments</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-sitemap"></i>
                </div>
              </div>
              <p className="admin-mb-3">Manage departments and structure</p>
              <Link to="/admin/departments" className="admin-btn admin-btn-primary admin-btn-sm">
                Manage Departments
              </Link>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Job Management</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
              </div>
              <p className="admin-mb-3">Oversee all job postings</p>
              <Link to="/admin/jobs" className="admin-btn admin-btn-primary admin-btn-sm">
                Manage Jobs
              </Link>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">Reports</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
              </div>
              <p className="admin-mb-3">Generate system reports</p>
              <Link to="/admin/reports" className="admin-btn admin-btn-warning admin-btn-sm">
                Generate Reports
              </Link>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">System Settings</h3>
                <div className="admin-stat-icon">
                  <i className="fas fa-cog"></i>
                </div>
              </div>
              <p className="admin-mb-3">Configure system preferences</p>
              <Link to="/admin/settings" className="admin-btn admin-btn-secondary admin-btn-sm">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
