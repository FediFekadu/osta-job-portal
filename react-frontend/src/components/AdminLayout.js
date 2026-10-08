import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/AdminComponents.css';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin/users', icon: 'fas fa-users', label: 'Manage Users' },
    { path: '/admin/departments', icon: 'fas fa-building', label: 'Departments' },
    { path: '/admin/create-employer', icon: 'fas fa-user-plus', label: 'Create Employer' },
    { path: '/admin/jobs', icon: 'fas fa-briefcase', label: 'Manage Jobs' },
    { path: '/admin/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
    { path: '/admin/analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
    { path: '/admin/notifications', icon: 'fas fa-bell', label: 'Notifications' },
    { path: '/admin/profile', icon: 'fas fa-user-cog', label: 'Profile' },
    { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-logo">
            <i className="fas fa-shield-alt"></i>
            {!sidebarCollapsed && <span>Admin Panel</span>}
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas fa-${sidebarCollapsed ? 'angle-right' : 'angle-left'}`}></i>
          </button>
        </div>

        <nav className="admin-nav">
          <ul>
            {adminMenuItems.map((item) => (
              <li key={item.path}>
                <button
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <i className={item.icon}></i>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="nav-item logout-btn"
            onClick={logout}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Admin Header */}
        <header className="admin-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">Admin</h1>
            </div>
            
            <div className="header-right">
              <div className="admin-profile">
                <div className="profile-avatar">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user?.name || 'Administrator'}</span>
                  <span className="profile-role">System Admin</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
