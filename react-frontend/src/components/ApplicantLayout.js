import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ApplicantLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/applicant/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/applicant/profile', icon: 'fas fa-user', label: 'Profile' },
    { path: '/applicant/apply', icon: 'fas fa-briefcase', label: 'Browse Jobs' },
    { path: '/applicant/applications', icon: 'fas fa-file-alt', label: 'My Applications' },
    { path: '/applicant/saved-jobs', icon: 'fas fa-heart', label: 'Saved Jobs' },
    { path: '/applicant/alerts', icon: 'fas fa-bell', label: 'Job Alerts' },
    { path: '/applicant/export', icon: 'fas fa-download', label: 'Export Data' }
  ];

  return (
    <div className="applicant-layout">
      <div className="layout-sidebar">
        <div className="sidebar-header">
          <h3><i className="fas fa-user-tie"></i> Job Seeker Portal</h3>
        </div>
        
        <div className="sidebar-user">
          <div className="user-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="user-info">
            <h4>{user?.full_name}</h4>
            <p>{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.path}>
                <a 
                  href={item.path}
                  className={window.location.pathname === item.path ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                  }}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="layout-main">
        <div className="main-header">
          <div className="header-left">
            <h1>OSTA Job Portal</h1>
          </div>
          <div className="header-right">
            <div className="user-menu">
              <span>Welcome, {user?.full_name}</span>
              <button onClick={handleLogout} className="btn-logout">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ApplicantLayout;
