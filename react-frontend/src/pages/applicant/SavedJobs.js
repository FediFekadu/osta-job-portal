import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const SavedJobs = () => {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  useEffect(() => {
    // Filter jobs based on search term
    const filtered = savedJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [savedJobs, searchTerm]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSavedJobs();
      if (response.success) {
        setSavedJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      const response = await apiService.unsaveJob(jobId);
      if (response.success) {
        setSavedJobs(prev => prev.filter(job => job.id !== jobId));
      }
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const handleApplyToJob = (jobId) => {
    window.location.href = `/applicant/apply?job_id=${jobId}`;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading saved jobs...</p>
      </div>
    );
  }

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <h1>Saved Jobs</h1>
        <p>Jobs you've bookmarked for later review</p>
      </div>

      <div className="search-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search saved jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="jobs-count">
        <span>{filteredJobs.length} saved job{filteredJobs.length !== 1 ? 's' : ''}</span>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="jobs-grid">
          {filteredJobs.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <div className="job-type-badge">
                  {job.employment_type.replace('_', ' ')}
                </div>
                <button
                  className="unsave-btn"
                  onClick={() => handleUnsaveJob(job.id)}
                  title="Remove from saved jobs"
                >
                  <i className="fas fa-bookmark"></i>
                </button>
              </div>

              <h3 className="job-title">{job.title}</h3>
              
              <div className="job-meta">
                <div className="meta-item">
                  <i className="fas fa-building"></i>
                  <span>{job.company_name || job.department_name}</span>
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
                <button
                  className="btn btn-primary"
                  onClick={() => handleApplyToJob(job.id)}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Apply Now
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.href = `/job-details/${job.id}`}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  View Details
                </button>
              </div>

              <div className="job-saved-date">
                <small>Saved on {new Date(job.saved_at).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <i className="fas fa-bookmark fa-3x"></i>
          <h3>No saved jobs</h3>
          <p>
            {searchTerm 
              ? 'No saved jobs match your search criteria.'
              : 'You haven\'t saved any jobs yet. Start browsing and save jobs you\'re interested in!'
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

export default SavedJobs;
