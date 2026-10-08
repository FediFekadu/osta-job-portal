import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { path: '/jobs', icon: 'fas fa-briefcase', label: 'Browse Jobs' },
    { path: '/applications', icon: 'fas fa-paper-plane', label: 'My Applications' },
    { path: '/saved-jobs', icon: 'fas fa-bookmark', label: 'Saved Jobs' },
    { path: '/job-alerts', icon: 'fas fa-bell', label: 'Job Alerts' },
    { path: '/profile', icon: 'fas fa-user', label: 'Profile' },
  ];

  const handleNavigation = (path) => {
    if (path.startsWith('/jobs') || path.startsWith('/applications')) {
      // For now, redirect to PHP pages
      window.location.href = `../applicant${path === '/jobs' ? '/../jobs.php' : '/dashboard.php'}`;
    } else {
      navigate(path);
    }
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-briefcase"></i>
          {!isCollapsed && <span>OSTA Portal</span>}
        </div>
        <button 
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className={`fas fa-${isCollapsed ? 'angle-right' : 'angle-left'}`}></i>
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <button
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNavigation(item.path)}
                title={isCollapsed ? item.label : ''}
              >
                <i className={item.icon}></i>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="nav-item logout-btn"
          onClick={() => window.location.href = '../logout.php'}
          title={isCollapsed ? 'Logout' : ''}
        >
          <i className="fas fa-sign-out-alt"></i>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
