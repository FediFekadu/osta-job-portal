import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const ApplyJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState({
    cover_letter: '',
    resume_file: null
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobDetails();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplication(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setMessage('Please upload a PDF or Word document.');
        return;
      }

      if (file.size > maxSize) {
        setMessage('File size must be less than 5MB.');
        return;
      }

      setApplication(prev => ({
        ...prev,
        resume_file: file
      }));
      setMessage('');
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('job_id', jobId);
      formData.append('cover_letter', application.cover_letter);
      if (application.resume_file) {
        formData.append('resume', application.resume_file);
      }

      const response = await apiService.post('/api/applicant/apply.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setMessage('Application submitted successfully!');
        setTimeout(() => {
          navigate('/applicant/applications');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
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
    <div className="apply-job">
      <div className="job-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Apply for {job.title}</h1>
      </div>

      <div className="apply-content">
        <div className="job-summary">
          <h3>Job Summary</h3>
          <div className="job-info">
            <p><strong>Company:</strong> {job.company_name}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Type:</strong> {job.employment_type}</p>
            <p><strong>Department:</strong> {job.department_name}</p>
            {job.salary_range && (
              <p><strong>Salary:</strong> {job.salary_range}</p>
            )}
            <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="application-form">
          <h3>Your Application</h3>
          
          {message && (
            <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
              {message}
            </div>
          )}

          <form onSubmit={submitApplication}>
            <div className="form-group">
              <label htmlFor="cover_letter">Cover Letter *</label>
              <textarea
                id="cover_letter"
                name="cover_letter"
                value={application.cover_letter}
                onChange={handleInputChange}
                rows="8"
                placeholder="Write a compelling cover letter explaining why you're the perfect fit for this position..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="resume">Resume/CV *</label>
              <div className="file-upload">
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
                <div className="file-upload-info">
                  <i className="fas fa-upload"></i>
                  <span>Upload your resume (PDF, DOC, DOCX - Max 5MB)</span>
                </div>
                {application.resume_file && (
                  <div className="file-selected">
                    <i className="fas fa-file"></i>
                    <span>{application.resume_file.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="application-terms">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>I confirm that the information provided is accurate and I agree to the terms and conditions.</span>
              </label>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Submit Application
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyJob;
