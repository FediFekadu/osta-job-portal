import React, { useState } from 'react';

const JobApplicationForm = ({ job, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          resume: 'File size must be less than 5MB'
        }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          resume: 'Only PDF, DOC, and DOCX files are allowed'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
      setErrors(prev => ({
        ...prev,
        resume: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    }
    
    if (!formData.resume) {
      newErrors.resume = 'Resume is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('job_id', job.id);
      submitData.append('cover_letter', formData.coverLetter);
      submitData.append('resume', formData.resume);
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="job-application-form-overlay">
      <div className="job-application-form">
        <div className="form-header">
          <h2>Apply for: {job.title}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="job-info">
          <div className="job-details">
            <h3>{job.company_name}</h3>
            <p className="job-location">
              <i className="fas fa-map-marker-alt"></i>
              {job.location}
            </p>
            <p className="job-type">
              <i className="fas fa-briefcase"></i>
              {job.job_type}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="application-form">
          <div className="form-group">
            <label htmlFor="coverLetter">Cover Letter *</label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleInputChange}
              placeholder="Write a compelling cover letter that highlights your qualifications for this position..."
              rows="6"
              className={errors.coverLetter ? 'error' : ''}
            />
            {errors.coverLetter && (
              <span className="error-message">{errors.coverLetter}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="resume">Resume *</label>
            <div className="file-upload">
              <input
                type="file"
                id="resume"
                name="resume"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className={errors.resume ? 'error' : ''}
              />
              <div className="file-upload-info">
                <i className="fas fa-cloud-upload-alt"></i>
                <span>Choose file or drag and drop</span>
                <small>Accepted formats: PDF, DOC, DOCX (Max: 5MB)</small>
              </div>
            </div>
            {formData.resume && (
              <div className="selected-file">
                <i className="fas fa-file"></i>
                <span>{formData.resume.name}</span>
              </div>
            )}
            {errors.resume && (
              <span className="error-message">{errors.resume}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
