import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const Apply = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    employment_type: '',
    salary_min: ''
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, [searchTerm, filters]);

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        ...filters
      });
      
      const response = await apiService.get(`/api/jobs.php?${params}`);
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.get('/api/departments.php');
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}/apply`);
  };

  const handleSaveJob = async (jobId) => {
    try {
      await apiService.post('/api/applicant/saved-jobs.php', { job_id: jobId });
      // Show success message or update UI
    } catch (error) {
      console.error('Error saving job:', error);
    }
  };

  return (
    <div className="apply-jobs">
      <div className="page-header">
        <h1><i className="fas fa-briefcase"></i> Available Jobs</h1>
        <p>Find and apply to jobs that match your skills</p>
      </div>

      <div className="search-filters">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search jobs by title, company, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-row">
          <select
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />

          <select
            value={filters.employment_type}
            onChange={(e) => setFilters({...filters, employment_type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="contract">Contract</option>
          </select>

          <input
            type="number"
            placeholder="Min Salary"
            value={filters.salary_min}
            onChange={(e) => setFilters({...filters, salary_min: e.target.value})}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading jobs...</div>
      ) : (
        <div className="jobs-grid">
          {jobs.length === 0 ? (
            <div className="no-jobs">
              <i className="fas fa-briefcase"></i>
              <h3>No jobs found</h3>
              <p>Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <button 
                    onClick={() => handleSaveJob(job.id)}
                    className="btn-save-job"
                  >
                    <i className="far fa-heart"></i>
                  </button>
                </div>

                <div className="job-company">
                  <i className="fas fa-building"></i>
                  <span>{job.company_name}</span>
                </div>

                <div className="job-details">
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{job.location}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-briefcase"></i>
                    <span>{job.employment_type}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{job.department_name}</span>
                  </div>
                  {job.salary_range && (
                    <div className="detail-item">
                      <i className="fas fa-dollar-sign"></i>
                      <span>{job.salary_range}</span>
                    </div>
                  )}
                </div>

                <div className="job-description">
                  <p>{job.description.substring(0, 150)}...</p>
                </div>

                <div className="job-meta">
                  <span className="posted-date">
                    Posted {new Date(job.posted_date).toLocaleDateString()}
                  </span>
                  <span className="deadline">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>

                <div className="job-actions">
                  <button 
                    onClick={() => handleApply(job.id)}
                    className="btn-apply"
                  >
                    <i className="fas fa-paper-plane"></i> Apply Now
                  </button>
                  <button 
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="btn-view-details"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Apply;
