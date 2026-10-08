import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import '../../styles/AdminComponents.css';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total_jobs: 0,
    active_jobs: 0,
    pending_jobs: 0,
    closed_jobs: 0,
    draft_jobs: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    department: 'all'
  });
  
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage] = useState(10);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getAdminJobs();
      
      if (response?.data?.success) {
        setJobs(response.data.data || []);
        setStats(response.data.stats || stats);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.department_name?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      await apiService.updateJobStatus(jobId, { status: newStatus });
      setJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: newStatus }
            : job
        )
      );
      setSuccess(`Job status updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating job status:', error);
      setError('Failed to update job status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        await apiService.deleteAdminJob(jobId);
        setJobs(prev => prev.filter(job => job.id !== jobId));
        setSuccess('Job deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting job:', error);
        setError('Failed to delete job');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedJobs.length === 0) {
      setError('Please select jobs to perform bulk action');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (window.confirm(`Are you sure you want to ${action} ${selectedJobs.length} selected jobs?`)) {
      try {
        for (const jobId of selectedJobs) {
          if (action === 'delete') {
            await apiService.deleteAdminJob(jobId);
          } else {
            await apiService.updateJobStatus(jobId, { status: action });
          }
        }
        
        if (action === 'delete') {
          setJobs(prev => prev.filter(job => !selectedJobs.includes(job.id)));
        } else {
          setJobs(prev => 
            prev.map(job => 
              selectedJobs.includes(job.id) 
                ? { ...job, status: action }
                : job
            )
          );
        }
        
        setSelectedJobs([]);
        setSuccess(`Bulk ${action} completed successfully`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error performing bulk action:', error);
        setError('Failed to perform bulk action');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectAllJobs = () => {
    const currentPageJobs = getCurrentPageJobs().map(job => job.id);
    setSelectedJobs(prev => 
      prev.length === currentPageJobs.length 
        ? []
        : currentPageJobs
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      closed: 'danger',
      draft: 'secondary'
    };
    return colors[status] || 'secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentPageJobs = () => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    return filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  };

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  if (loading) {
    return (
      <div className="admin-content">
        <div className="admin-loading">
          <div className="admin-spinner"></div>
          <span>Loading jobs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-briefcase"></i>
          Job Management
        </h1>
        <p className="admin-page-subtitle">Manage and oversee all job postings</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="admin-alert admin-alert-danger">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}
      
      {success && (
        <div className="admin-alert admin-alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Total Jobs</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-briefcase"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.total_jobs}</div>
          <div className="admin-stat-change">
            All job postings
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Active Jobs</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.active_jobs}</div>
          <div className="admin-stat-change positive">
            Currently accepting applications
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Pending Jobs</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.pending_jobs}</div>
          <div className="admin-stat-change warning">
            Awaiting approval
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-header">
            <h3 className="admin-stat-title">Closed Jobs</h3>
            <div className="admin-stat-icon">
              <i className="fas fa-times-circle"></i>
            </div>
          </div>
          <div className="admin-stat-value">{stats.closed_jobs}</div>
          <div className="admin-stat-change">
            No longer accepting applications
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-filter"></i>
            Filters & Actions
          </h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-filters-grid">
            <div className="admin-form-group">
              <label className="admin-form-label">Search Jobs</label>
              <div className="admin-input-group">
                <i className="fas fa-search admin-input-icon"></i>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Search by title, description, or department..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Status Filter</label>
              <select
                className="admin-form-control"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Bulk Actions</label>
              <div className="admin-btn-group">
                <button
                  className="admin-btn admin-btn-success admin-btn-sm"
                  onClick={() => handleBulkAction('active')}
                  disabled={selectedJobs.length === 0}
                >
                  <i className="fas fa-check"></i>
                  Activate Selected
                </button>
                <button
                  className="admin-btn admin-btn-warning admin-btn-sm"
                  onClick={() => handleBulkAction('pending')}
                  disabled={selectedJobs.length === 0}
                >
                  <i className="fas fa-clock"></i>
                  Set Pending
                </button>
                <button
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => handleBulkAction('delete')}
                  disabled={selectedJobs.length === 0}
                >
                  <i className="fas fa-trash"></i>
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-list"></i>
            Jobs ({filteredJobs.length})
          </h2>
          <div className="admin-card-actions">
            <span className="admin-text-muted">
              {selectedJobs.length > 0 && `${selectedJobs.length} selected`}
            </span>
          </div>
        </div>
        <div className="admin-card-body">
          {filteredJobs.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fas fa-briefcase"></i>
              <h3>No Jobs Found</h3>
              <p>No jobs match your current filters.</p>
            </div>
          ) : (
            <>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedJobs.length === getCurrentPageJobs().length && getCurrentPageJobs().length > 0}
                          onChange={selectAllJobs}
                        />
                      </th>
                      <th>Job Title</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Applications</th>
                      <th>Posted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageJobs().map((job) => (
                      <tr key={job.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedJobs.includes(job.id)}
                            onChange={() => toggleJobSelection(job.id)}
                          />
                        </td>
                        <td>
                          <div className="admin-job-info">
                            <h4 className="admin-job-title">{job.title}</h4>
                            <p className="admin-job-location">
                              <i className="fas fa-map-marker-alt"></i>
                              {job.location}
                            </p>
                          </div>
                        </td>
                        <td>
                          <span className="admin-department-badge">
                            {job.department_name || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-badge admin-badge-${getStatusColor(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className="admin-application-count">
                            <i className="fas fa-users"></i>
                            {job.application_count || 0}
                          </span>
                        </td>
                        <td>
                          <span className="admin-date">
                            {formatDate(job.created_at)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-action-buttons">
                            <button
                              className="admin-btn admin-btn-sm admin-btn-primary"
                              onClick={() => {
                                setSelectedJob(job);
                                setShowJobModal(true);
                              }}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            
                            {job.status === 'pending' && (
                              <button
                                className="admin-btn admin-btn-sm admin-btn-success"
                                onClick={() => handleStatusUpdate(job.id, 'active')}
                                title="Approve Job"
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                            
                            {job.status === 'active' && (
                              <button
                                className="admin-btn admin-btn-sm admin-btn-warning"
                                onClick={() => handleStatusUpdate(job.id, 'closed')}
                                title="Close Job"
                              >
                                <i className="fas fa-pause"></i>
                              </button>
                            )}
                            
                            <button
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              onClick={() => handleDeleteJob(job.id)}
                              title="Delete Job"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                    Previous
                  </button>
                  
                  <span className="admin-pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="admin-modal-overlay" onClick={() => setShowJobModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fas fa-briefcase"></i>
                Job Details
              </h3>
              <button 
                className="admin-btn-close"
                onClick={() => setShowJobModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-job-details">
                <div className="admin-job-header">
                  <h2>{selectedJob.title}</h2>
                  <span className={`admin-badge admin-badge-${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                  </span>
                </div>
                
                <div className="admin-job-meta">
                  <div className="admin-meta-item">
                    <i className="fas fa-building"></i>
                    <span>{selectedJob.department_name}</span>
                  </div>
                  <div className="admin-meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="admin-meta-item">
                    <i className="fas fa-users"></i>
                    <span>{selectedJob.application_count} Applications</span>
                  </div>
                  <div className="admin-meta-item">
                    <i className="fas fa-calendar"></i>
                    <span>Posted {formatDate(selectedJob.created_at)}</span>
                  </div>
                </div>
                
                <div className="admin-job-section">
                  <h4>Description</h4>
                  <p>{selectedJob.description}</p>
                </div>
                
                {selectedJob.requirements && (
                  <div className="admin-job-section">
                    <h4>Requirements</h4>
                    <p>{selectedJob.requirements}</p>
                  </div>
                )}
                
                {selectedJob.salary_range && (
                  <div className="admin-job-section">
                    <h4>Salary Range</h4>
                    <p>{selectedJob.salary_range}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button 
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowJobModal(false)}
              >
                Close
              </button>
              <div className="admin-btn-group">
                {selectedJob.status === 'pending' && (
                  <button
                    className="admin-btn admin-btn-success"
                    onClick={() => {
                      handleStatusUpdate(selectedJob.id, 'active');
                      setShowJobModal(false);
                    }}
                  >
                    <i className="fas fa-check"></i>
                    Approve Job
                  </button>
                )}
                {selectedJob.status === 'active' && (
                  <button
                    className="admin-btn admin-btn-warning"
                    onClick={() => {
                      handleStatusUpdate(selectedJob.id, 'closed');
                      setShowJobModal(false);
                    }}
                  >
                    <i className="fas fa-pause"></i>
                    Close Job
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageJobs;
