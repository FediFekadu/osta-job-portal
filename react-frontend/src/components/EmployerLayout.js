import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EmployerLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { path: '/employer/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/employer/post-job', icon: 'fas fa-plus-circle', label: 'Post Job' },
    { path: '/employer/manage-jobs', icon: 'fas fa-briefcase', label: 'Manage Jobs' },
    { path: '/employer/applications', icon: 'fas fa-file-alt', label: 'Applications' },
    { path: '/employer/profile', icon: 'fas fa-user-circle', label: 'Profile' },
    { path: '/employer/profile-settings', icon: 'fas fa-cog', label: 'Settings' },
    { path: '/employer/reports', icon: 'fas fa-chart-bar', label: 'Reports' },
  ];

  return (
    <div className="employer-layout">
      <aside className={`employer-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="employer-logo">
            <i className="fas fa-building"></i>
            {!sidebarCollapsed && <span>OSTA Employer</span>}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`fas fa-${sidebarCollapsed ? 'expand-arrows-alt' : 'compress-arrows-alt'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <i className={item.icon}></i>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            {!sidebarCollapsed && (
              <>
                <div className="user-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.username}</span>
                  <span className="user-role">Employer</span>
                </div>
              </>
            )}
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className={`employer-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="employer-header">
          <div className="header-content">
            <div className="header-left">
              <h1>Employer Portal</h1>
            </div>
            <div className="header-right">
              <div className="header-actions">
                <button className="notification-btn">
                  <i className="fas fa-bell"></i>
                  <span className="notification-badge">3</span>
                </button>
                <div className="user-menu">
                  <span className="welcome-text">Welcome, {user?.username}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="employer-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EmployerLayout;