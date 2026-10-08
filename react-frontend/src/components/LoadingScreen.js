import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-logo">
          <i className="fas fa-briefcase"></i>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <h2>OSTA Job Portal</h2>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
