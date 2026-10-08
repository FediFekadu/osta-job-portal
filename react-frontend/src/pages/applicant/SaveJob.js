import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const SaveJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobDetails();
    checkIfSaved();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await apiService.get(`/api/jobs.php?id=${jobId}`);
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await apiService.get(`/api/applicant/saved-jobs.php?job_id=${jobId}`);
      if (response.data.success) {
        setIsSaved(response.data.is_saved);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const toggleSaveJob = async () => {
    setSaving(true);
    try {
      if (isSaved) {
        // Remove from saved jobs
        await apiService.delete(`/api/applicant/saved-jobs.php?job_id=${jobId}`);
        setIsSaved(false);
        setMessage('Job removed from saved jobs');
      } else {
        // Add to saved jobs
        await apiService.post('/api/applicant/saved-jobs.php', { job_id: jobId });
        setIsSaved(true);
        setMessage('Job saved successfully!');
      }
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving job. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="error-message">
        <h2>Job not found</h2>
        <button onClick={() => navigate('/jobs')} className="btn-back">
          Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="save-job">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>{isSaved ? 'Saved Job' : 'Save Job'}</h1>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="job-card">
        <div className="job-header">
          <h2>{job.title}</h2>
          <button 
            onClick={toggleSaveJob}
            className={`btn-save ${isSaved ? 'saved' : ''}`}
            disabled={saving}
          >
            {saving ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className={`fas ${isSaved ? 'fa-heart' : 'fa-heart-o'}`}></i>
            )}
            {isSaved ? 'Saved' : 'Save Job'}
          </button>
        </div>

        <div className="job-details">
          <div className="detail-row">
            <span className="label">Company:</span>
            <span className="value">{job.company_name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Location:</span>
            <span className="value">{job.location}</span>
          </div>
          <div className="detail-row">
            <span className="label">Department:</span>
            <span className="value">{job.department_name}</span>
          </div>
          <div className="detail-row">
            <span className="label">Employment Type:</span>
            <span className="value">{job.employment_type}</span>
          </div>
          {job.salary_range && (
            <div className="detail-row">
              <span className="label">Salary:</span>
              <span className="value">{job.salary_range}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="label">Deadline:</span>
            <span className="value">{new Date(job.deadline).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="job-description">
          <h3>Job Description</h3>
          <p>{job.description}</p>
        </div>

        {job.requirements && (
          <div className="job-requirements">
            <h3>Requirements</h3>
            <p>{job.requirements}</p>
          </div>
        )}

        <div className="job-actions">
          <button 
            onClick={() => navigate(`/jobs/${jobId}/apply`)}
            className="btn-apply"
          >
            <i className="fas fa-paper-plane"></i> Apply Now
          </button>
          <button 
            onClick={() => navigate('/applicant/saved-jobs')}
            className="btn-view-saved"
          >
            <i className="fas fa-heart"></i> View All Saved Jobs
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveJob;
