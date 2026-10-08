import React from 'react';

const ApplicationsTable = ({ applications }) => {
  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge pending',
      shortlisted: 'status-badge shortlisted',
      rejected: 'status-badge rejected',
      accepted: 'status-badge accepted'
    };
    
    return (
      <span className={statusClasses[status] || 'status-badge'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!applications || applications.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-inbox"></i>
        <h3>No Applications Yet</h3>
        <p>Start applying to jobs to see your applications here.</p>
        <a href="/jobs" className="btn btn-primary">Browse Jobs</a>
      </div>
    );
  }

  return (
    <div className="applications-table">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>
                  <div className="job-title">
                    <h4>{application.job_title}</h4>
                    <span className="job-type">{application.job_type}</span>
                  </div>
                </td>
                <td>
                  <div className="company-info">
                    <span className="company-name">{application.company_name}</span>
                    <span className="location">{application.location}</span>
                  </div>
                </td>
                <td>{formatDate(application.created_at)}</td>
                <td>{getStatusBadge(application.status)}</td>
                <td>
                  <div className="actions">
                    <button className="btn-icon" title="View Details">
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-icon" title="Download Resume">
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsTable;
