import React from 'react';

const RecentActivityTable = ({ activities = [] }) => {
  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : [];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user':
        return 'fas fa-user-plus';
      case 'job':
        return 'fas fa-briefcase';
      case 'application':
        return 'fas fa-paper-plane';
      default:
        return 'fas fa-circle';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user':
        return 'primary';
      case 'job':
        return 'success';
      case 'application':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!safeActivities || safeActivities.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-history"></i>
        <h3>No Recent Activity</h3>
        <p>System activity will appear here when users interact with the platform.</p>
      </div>
    );
  }

  return (
    <div className="recent-activity-table">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>User/Item</th>
              <th>Department</th>
              <th>Action</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {safeActivities.map((activity, index) => (
              <tr key={index}>
                <td>
                  <div className="activity-type">
                    <div className={`activity-icon ${getActivityColor(activity.type)}`}>
                      <i className={getActivityIcon(activity.type)}></i>
                    </div>
                    <span className="activity-label">
                      {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="activity-subject">
                    <strong>{activity.username || activity.title}</strong>
                    {activity.role && (
                      <span className="user-role">{activity.role}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className="department-name">
                    {activity.department_name || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className={`action-badge ${getActivityColor(activity.type)}`}>
                    {activity.action}
                  </span>
                </td>
                <td>
                  <span className="activity-date">
                    {formatDate(activity.timestamp)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivityTable;
