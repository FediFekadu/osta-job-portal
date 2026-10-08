import React from 'react';

const PendingApprovalsCard = ({ title, items = [], type, onApproval, emptyMessage }) => {
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];
  
  const handleApprove = (id) => {
    onApproval(type, id, 'approve');
  };

  const handleReject = (id) => {
    onApproval(type, id, 'reject');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="pending-approvals-card">
      <div className="card-header">
        <h3>{title}</h3>
        <span className="count-badge">{safeItems.length}</span>
      </div>
      
      <div className="card-body">
        {safeItems.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-check-circle"></i>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="approvals-list">
            {safeItems.map((item) => (
              <div key={item.id} className="approval-item">
                <div className="item-info">
                  <h4>{item.title || item.username}</h4>
                  <p className="item-meta">
                    {type === 'job' ? (
                      <>
                        <span className="department">{item.department_name}</span>
                        <span className="date">Posted: {formatDate(item.created_at)}</span>
                      </>
                    ) : (
                      <>
                        <span className="role">{item.role}</span>
                        <span className="date">Registered: {formatDate(item.created_at)}</span>
                      </>
                    )}
                  </p>
                </div>
                
                <div className="approval-actions">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => handleApprove(item.id)}
                  >
                    <i className="fas fa-check"></i>
                    Approve
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(item.id)}
                  >
                    <i className="fas fa-times"></i>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalsCard;