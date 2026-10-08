import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`stats-card ${color}`}>
      <div className="stats-card-content">
        <div className="stats-card-header">
          <h3 className="stats-title">{title}</h3>
          <div className="stats-icon">
            <i className={icon}></i>
          </div>
        </div>
        <div className="stats-value">{value}</div>
        <div className="stats-trend">
          <i className="fas fa-arrow-up"></i>
          <span>+12% from last month</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
