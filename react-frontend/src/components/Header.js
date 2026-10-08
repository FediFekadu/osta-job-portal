import React, { useState } from 'react';

const Header = ({ user }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="page-title">Dashboard</h1>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button className="notification-btn">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            
            <div className="profile-dropdown">
              <button 
                className="profile-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <div className="profile-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="profile-info">
                  <span className="profile-name">{user?.name || 'User'}</span>
                  <span className="profile-role">Job Seeker</span>
                </div>
                <i className="fas fa-chevron-down"></i>
              </button>
              
              {showProfileDropdown && (
                <div className="dropdown-menu">
                  <a href="/profile" className="dropdown-item">
                    <i className="fas fa-user"></i>
                    <span>Profile</span>
                  </a>
                  <a href="/settings" className="dropdown-item">
                    <i className="fas fa-cog"></i>
                    <span>Settings</span>
                  </a>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item logout"
                    onClick={() => window.location.href = '../logout.php'}
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
