import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredApplications, setFilteredApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    // Filter applications based on status and search term
    let filtered = applications;
    
    if (filter !== 'all') {
      filtered = filtered.filter(app => app.status === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredApplications(filtered);
  }, [applications, filter, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getApplicantApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'shortlisted': return 'status-shortlisted';
      case 'interviewed': return 'status-interviewed';
      case 'hired': return 'status-hired';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'reviewed': return 'fas fa-eye';
      case 'shortlisted': return 'fas fa-list';
      case 'interviewed': return 'fas fa-users';
      case 'hired': return 'fas fa-check-circle';
      case 'rejected': return 'fas fa-times-circle';
      default: return 'fas fa-clock';
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h1>My Applications</h1>
        <p>Track the status of your job applications</p>
      </div>

      <div className="applications-filters">
        <div className="search-section">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="status-filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({applications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({applications.filter(app => app.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
            onClick={() => setFilter('reviewed')}
          >
            Reviewed ({applications.filter(app => app.status === 'reviewed').length})
          </button>
          <button
            className={`filter-btn ${filter === 'shortlisted' ? 'active' : ''}`}
            onClick={() => setFilter('shortlisted')}
          >
            Shortlisted ({applications.filter(app => app.status === 'shortlisted').length})
          </button>
          <button
            className={`filter-btn ${filter === 'hired' ? 'active' : ''}`}
            onClick={() => setFilter('hired')}
          >
            Hired ({applications.filter(app => app.status === 'hired').length})
          </button>
        </div>
      </div>

      <div className="applications-count">
        <span>{filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}</span>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="applications-list">
          {filteredApplications.map(application => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="job-info">
                  <h3 className="job-title">{application.job_title}</h3>
                  <p className="company-name">{application.company_name || application.department_name}</p>
                </div>
                <div className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                  <i className={getStatusIcon(application.status)}></i>
                  <span>{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                </div>
              </div>

              <div className="application-meta">
                <div className="meta-item">
                  <i className="fas fa-calendar-alt"></i>
                  <span>Applied: {new Date(application.applied_at).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{application.job_location}</span>
                </div>
                <div className="meta-item">
                  <i className="fas fa-briefcase"></i>
                  <span>{application.employment_type?.replace('_', ' ')}</span>
                </div>
                {application.salary_range && (
                  <div className="meta-item">
                    <i className="fas fa-money-bill-wave"></i>
                    <span>{application.salary_range}</span>
                  </div>
                )}
              </div>

              {application.cover_letter && (
                <div className="cover-letter-preview">
                  <h4>Cover Letter</h4>
                  <p>
                    {application.cover_letter.length > 200 
                      ? application.cover_letter.substring(0, 200) + '...'
                      : application.cover_letter
                    }
                  </p>
                </div>
              )}

              <div className="application-actions">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => window.location.href = `/job-details/${application.job_id}`}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  View Job
                </button>
                
                {application.resume_path && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => window.open(`/uploads/resumes/${application.resume_path}`, '_blank')}
                  >
                    <i className="fas fa-file-pdf me-2"></i>
                    View Resume
                  </button>
                )}

                {application.status === 'pending' && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to withdraw this application?')) {
                        // Handle withdrawal
                      }
                    }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Withdraw
                  </button>
                )}
              </div>

              {application.notes && (
                <div className="application-notes">
                  <h4>Notes from Employer</h4>
                  <p>{application.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-file-alt fa-3x"></i>
          <h3>No applications found</h3>
          <p>
            {searchTerm || filter !== 'all'
              ? 'No applications match your current filters.'
              : 'You haven\'t applied to any jobs yet. Start browsing and apply to jobs that interest you!'
            }
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/applicant/browse-jobs'}
          >
            <i className="fas fa-search me-2"></i>
            Browse Jobs
          </button>
        </div>
      )}
    </div>
  );
};

export default Applications;
