import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { apiService } from '../services/apiService';
import { Link } from 'react-router-dom';
import '../../styles/ApplicantComponents.css';
const SavedJobs = () => {
  const [user, setUser] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, jobsResponse] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getSavedJobs()
      ]);
      
      setUser(userResponse.data);
      setSavedJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await apiService.unsaveJob(jobId);
      setSavedJobs(savedJobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error unsaving job:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main-content">
        <Header user={user} />
        
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Saved Jobs</h1>
            <p className="page-subtitle">Jobs you've bookmarked for later</p>
          </div>

          {savedJobs.length === 0 ? (
            <div className="content-card">
              <div className="empty-state">
                <i className="fas fa-bookmark"></i>
                <h3>No Saved Jobs</h3>
                <p>You haven't saved any jobs yet. Start browsing and save jobs that interest you!</p>
                <a href="/jobs" className="btn btn-primary">Browse Jobs</a>
              </div>
            </div>
          ) : (
            <div className="jobs-grid">
              {savedJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div className="job-title-section">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="company-name">{job.company_name}</p>
                    </div>
                    <button 
                      className="unsave-btn"
                      onClick={() => handleUnsaveJob(job.id)}
                      title="Remove from saved"
                    >
                      <i className="fas fa-bookmark"></i>
                    </button>
                  </div>
                  
                  <div className="job-details">
                    <div className="job-meta">
                      <span className="job-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {job.location}
                      </span>
                      <span className="job-type">
                        <i className="fas fa-briefcase"></i>
                        {job.job_type}
                      </span>
                      <span className="job-salary">
                        <i className="fas fa-dollar-sign"></i>
                        {job.salary_range || 'Not specified'}
                      </span>
                    </div>
                    
                    <p className="job-description">
                      {job.description?.substring(0, 150)}...
                    </p>
                    
                    <div className="job-tags">
                      {job.requirements?.split(',').slice(0, 3).map((req, index) => (
                        <span key={index} className="job-tag">
                          {req.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="job-card-footer">
                    <div className="job-dates">
                      <span className="saved-date">
                        Saved: {formatDate(job.saved_at)}
                      </span>
                      <span className="deadline">
                        Deadline: {formatDate(job.deadline)}
                      </span>
                    </div>
                    
                    <div className="job-actions">
                      <a 
                        href={`/job-details/${job.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View Details
                      </a>
                      <a 
                        href={`/apply/${job.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Apply Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;
