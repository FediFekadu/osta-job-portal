import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const BrowseJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: '',
    department_id: '',
    page: 1
  });
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobs(filters);
      if (response.success) {
        setJobs(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSaveJob = async (jobId) => {
    try {
      const response = await apiService.saveJob(jobId);
      if (response.success) {
        // Update job in list to show as saved
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, is_saved: true } : job
        ));
      }
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const response = await apiService.unsaveJob(jobId);
      if (response.success) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, is_saved: false } : job
        ));
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  return (
    <div className="browse-jobs-container">
      <div className="browse-jobs-header">
        <h1>Browse Jobs</h1>
        <p>Find your next career opportunity</p>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={filters.employment_type}
              onChange={(e) => handleFilterChange('employment_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          <div className="filter-group">
            <select
              value={filters.department_id}
              onChange={(e) => handleFilterChange('department_id', e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <input
              type="text"
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <>
          <div className="jobs-count">
            <span>{pagination.total || 0} job{pagination.total !== 1 ? 's' : ''} found</span>
          </div>

          {jobs.length > 0 ? (
            <div className="jobs-grid">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <div className="job-type-badge">
                      {job.employment_type.replace('_', ' ')}
                    </div>
                    {user && (
                      <button
                        className={`save-btn ${job.is_saved ? 'saved' : ''}`}
                        onClick={() => job.is_saved ? handleUnsaveJob(job.id) : handleSaveJob(job.id)}
                        title={job.is_saved ? 'Remove from saved jobs' : 'Save for later'}
                      >
                        <i className={`fas ${job.is_saved ? 'fa-bookmark' : 'fa-bookmark-o'}`}></i>
                      </button>
                    )}
                  </div>

                  <h3 className="job-title">{job.title}</h3>
                  
                  <div className="job-meta">
                    <div className="meta-item">
                      <i className="fas fa-building"></i>
                      <span>{job.department_name || 'OSTA'}</span>
                    </div>
                    <div className="meta-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{job.location}</span>
                    </div>
                    {job.salary_range && (
                      <div className="meta-item">
                        <i className="fas fa-money-bill-wave"></i>
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <i className="fas fa-clock"></i>
                      <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="job-description">
                    {job.description.length > 150 
                      ? job.description.substring(0, 150) + '...'
                      : job.description
                    }
                  </p>

                  <div className="job-actions">
                    {user && user.role === 'applicant' ? (
                      <>
                        {job.has_applied ? (
                          <button className="btn btn-success" disabled>
                            <i className="fas fa-check-circle me-2"></i>
                            Applied
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary"
                            onClick={() => window.location.href = `/applicant/apply?job_id=${job.id}`}
                          >
                            <i className="fas fa-paper-plane me-2"></i>
                            Apply Now
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/login'}
                      >
                        <i className="fas fa-sign-in-alt me-2"></i>
                        Login to Apply
                      </button>
                    )}
                    
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.href = `/job-details/${job.id}`}
                    >
                      <i className="fas fa-info-circle me-2"></i>
                      View Details
                    </button>
                  </div>

                  <div className="job-posted-date">
                    <small>Posted {new Date(job.created_at).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-search fa-3x"></i>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline-primary"
                disabled={pagination.page <= 1}
                onClick={() => handleFilterChange('page', pagination.page - 1)}
              >
                <i className="fas fa-chevron-left"></i>
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              
              <button
                className="btn btn-outline-primary"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handleFilterChange('page', pagination.page + 1)}
              >
                Next
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseJobs;
