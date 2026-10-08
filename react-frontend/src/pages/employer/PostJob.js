import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import '../../styles/EmployerComponents.css';
const PostJob = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    employment_type: 'full-time',
    location: '',
    salary_min: '',
    salary_max: '',
    currency: 'USD',
    description: '',
    requirements: '',
    benefits: '',
    application_deadline: '',
    positions_available: 1,
    experience_level: 'entry',
    education_level: 'bachelor',
    skills_required: '',
    remote_work: false,
    urgent: false,
    contact_email: '',
    contact_phone: '',
    interview_process: '',
    company_culture: '',
    growth_opportunities: ''
  });
  const [errors, setErrors] = useState({});
  const [savedDraft, setSavedDraft] = useState(false);

  useEffect(() => {
    fetchDepartments();
    loadDraft();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('job_posting_draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...draftData }));
        setSavedDraft(true);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  };

  const saveDraft = () => {
    localStorage.setItem('job_posting_draft', JSON.stringify(formData));
    setSavedDraft(true);
    setTimeout(() => setSavedDraft(false), 2000);
  };

  const clearDraft = () => {
    localStorage.removeItem('job_posting_draft');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Job title is required';
      if (!formData.department_id) newErrors.department_id = 'Department is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
      if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
    }

    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Job description is required';
      if (!formData.requirements.trim()) newErrors.requirements = 'Requirements are required';
      if (formData.description.length < 100) newErrors.description = 'Description should be at least 100 characters';
    }

    if (step === 3) {
      if (!formData.application_deadline) newErrors.application_deadline = 'Application deadline is required';
      
      if (formData.salary_min && formData.salary_max) {
        if (parseInt(formData.salary_min) >= parseInt(formData.salary_max)) {
          newErrors.salary_max = 'Maximum salary must be greater than minimum salary';
        }
      }

      const deadlineDate = new Date(formData.application_deadline);
      const today = new Date();
      if (deadlineDate <= today) {
        newErrors.application_deadline = 'Application deadline must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    setLoading(true);
    try {
      await apiService.createJob(formData);
      clearDraft();
      navigate('/employer/manage-jobs', { 
        state: { message: 'Job posted successfully!' }
      });
    } catch (error) {
      console.error('Error creating job:', error);
      setErrors({ submit: 'Failed to post job. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      <div className="steps">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
          >
            <div className="step-number">
              {currentStep > step ? <i className="fas fa-check"></i> : step}
            </div>
            <div className="step-label">
              {step === 1 && 'Basic Info'}
              {step === 2 && 'Description'}
              {step === 3 && 'Details'}
              {step === 4 && 'Review'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="form-step">
      <div className="step-header">
        <h2><i className="fas fa-info-circle me-2"></i>Basic Information</h2>
        <p>Start by providing the essential details about your job posting</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="title">Job Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="e.g. Senior Software Engineer"
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="department_id">Department *</label>
          <select
            id="department_id"
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className={`form-select ${errors.department_id ? 'error' : ''}`}
          >
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.department_id && <span className="error-text">{errors.department_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="employment_type">Employment Type *</label>
          <select
            id="employment_type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            className="form-select"
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={`form-input ${errors.location ? 'error' : ''}`}
            placeholder="e.g. New York, NY or Remote"
          />
          {errors.location && <span className="error-text">{errors.location}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="experience_level">Experience Level</label>
          <select
            id="experience_level"
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
            className="form-select"
          >
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead/Principal</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="positions_available">Positions Available</label>
          <input
            type="number"
            id="positions_available"
            name="positions_available"
            value={formData.positions_available}
            onChange={handleChange}
            className="form-input"
            min="1"
            max="50"
          />
        </div>
      </div>

      <div className="form-checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="remote_work"
            checked={formData.remote_work}
            onChange={handleChange}
          />
          <span className="checkmark"></span>
          <span className="checkbox-text">
            <strong>Remote work available</strong>
            <small>This position offers remote work options</small>
          </span>
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="urgent"
            checked={formData.urgent}
            onChange={handleChange}
          />
          <span className="checkmark"></span>
          <span className="checkbox-text">
            <strong>Urgent hiring</strong>
            <small>Priority listing for immediate hiring needs</small>
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-step">
      <div className="step-header">
        <h2><i className="fas fa-file-alt me-2"></i>Job Description</h2>
        <p>Provide detailed information about the role and requirements</p>
      </div>

      <div className="form-group">
        <label htmlFor="description">Job Description *</label>
        <div className="textarea-container">
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            rows="8"
            placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
          />
          <div className="character-count">
            {formData.description.length}/2000 characters
          </div>
        </div>
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="requirements">Requirements *</label>
        <textarea
          id="requirements"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          className={`form-textarea ${errors.requirements ? 'error' : ''}`}
          rows="6"
          placeholder="• Bachelor's degree in relevant field&#10;• 3+ years of experience&#10;• Proficiency in specific technologies..."
        />
        {errors.requirements && <span className="error-text">{errors.requirements}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="skills_required">Skills Required</label>
        <input
          type="text"
          id="skills_required"
          name="skills_required"
          value={formData.skills_required}
          onChange={handleChange}
          className="form-input"
          placeholder="JavaScript, React, Node.js, SQL (comma-separated)"
        />
        <small className="form-hint">Separate skills with commas</small>
      </div>

      <div className="form-group">
        <label htmlFor="benefits">Benefits & Perks</label>
        <textarea
          id="benefits"
          name="benefits"
          value={formData.benefits}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
          placeholder="• Health insurance&#10;• 401(k) matching&#10;• Flexible hours&#10;• Professional development budget..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="company_culture">Company Culture</label>
        <textarea
          id="company_culture"
          name="company_culture"
          value={formData.company_culture}
          onChange={handleChange}
          className="form-textarea"
          rows="3"
          placeholder="Describe your company culture, values, and work environment..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-step">
      <div className="step-header">
        <h2><i className="fas fa-cogs me-2"></i>Additional Details</h2>
        <p>Set salary range, deadline, and contact information</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="salary_min">Minimum Salary</label>
          <div className="input-group">
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="form-select currency-select"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input
              type="number"
              id="salary_min"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              className="form-input"
              placeholder="50000"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="salary_max">Maximum Salary</label>
          <div className="input-group">
            <span className="input-prefix">{formData.currency}</span>
            <input
              type="number"
              id="salary_max"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              className={`form-input ${errors.salary_max ? 'error' : ''}`}
              placeholder="80000"
            />
          </div>
          {errors.salary_max && <span className="error-text">{errors.salary_max}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="application_deadline">Application Deadline *</label>
          <input
            type="date"
            id="application_deadline"
            name="application_deadline"
            value={formData.application_deadline}
            onChange={handleChange}
            className={`form-input ${errors.application_deadline ? 'error' : ''}`}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.application_deadline && <span className="error-text">{errors.application_deadline}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="education_level">Education Level</label>
          <select
            id="education_level"
            name="education_level"
            value={formData.education_level}
            onChange={handleChange}
            className="form-select"
          >
            <option value="high-school">High School</option>
            <option value="associate">Associate Degree</option>
            <option value="bachelor">Bachelor's Degree</option>
            <option value="master">Master's Degree</option>
            <option value="phd">PhD</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="contact_email">Contact Email</label>
          <input
            type="email"
            id="contact_email"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            className="form-input"
            placeholder="hr@company.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact_phone">Contact Phone</label>
          <input
            type="tel"
            id="contact_phone"
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
            className="form-input"
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="interview_process">Interview Process</label>
        <textarea
          id="interview_process"
          name="interview_process"
          value={formData.interview_process}
          onChange={handleChange}
          className="form-textarea"
          rows="3"
          placeholder="Describe your interview process (e.g., phone screening, technical interview, final interview)..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="growth_opportunities">Growth Opportunities</label>
        <textarea
          id="growth_opportunities"
          name="growth_opportunities"
          value={formData.growth_opportunities}
          onChange={handleChange}
          className="form-textarea"
          rows="3"
          placeholder="Describe career advancement opportunities, training programs, mentorship..."
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="form-step">
      <div className="step-header">
        <h2><i className="fas fa-eye me-2"></i>Review & Publish</h2>
        <p>Review your job posting before publishing</p>
      </div>

      <div className="job-preview">
        <div className="preview-header">
          <h3>{formData.title}</h3>
          <div className="job-meta">
            <span className="meta-item">
              <i className="fas fa-building"></i>
              {departments.find(d => d.id === formData.department_id)?.name}
            </span>
            <span className="meta-item">
              <i className="fas fa-map-marker-alt"></i>
              {formData.location}
            </span>
            <span className="meta-item">
              <i className="fas fa-clock"></i>
              {formData.employment_type}
            </span>
            {formData.salary_min && formData.salary_max && (
              <span className="meta-item">
                <i className="fas fa-dollar-sign"></i>
                {formData.currency} {formData.salary_min} - {formData.salary_max}
              </span>
            )}
          </div>
        </div>

        <div className="preview-content">
          <div className="preview-section">
            <h4>Description</h4>
            <p>{formData.description}</p>
          </div>

          <div className="preview-section">
            <h4>Requirements</h4>
            <p>{formData.requirements}</p>
          </div>

          {formData.benefits && (
            <div className="preview-section">
              <h4>Benefits</h4>
              <p>{formData.benefits}</p>
            </div>
          )}

          <div className="preview-section">
            <h4>Application Details</h4>
            <p><strong>Deadline:</strong> {new Date(formData.application_deadline).toLocaleDateString()}</p>
            <p><strong>Positions Available:</strong> {formData.positions_available}</p>
            <p><strong>Experience Level:</strong> {formData.experience_level}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="post-job-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-plus-circle me-3"></i>Post New Job</h1>
          <p>Create a compelling job posting to attract the best candidates</p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={saveDraft}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            <i className="fas fa-save me-2"></i>
            Save Draft
          </button>
          {savedDraft && <span className="saved-indicator">Draft saved!</span>}
        </div>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="job-form">
        {errors.submit && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {errors.submit}
          </div>
        )}

        <div className="form-container">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="form-actions">
          <div className="action-left">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-outline btn-lg"
              >
                <i className="fas fa-arrow-left me-2"></i>
                Previous
              </button>
            )}
          </div>

          <div className="action-right">
            <button
              type="button"
              onClick={() => navigate('/employer/manage-jobs')}
              className="btn btn-outline btn-lg me-3"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary btn-lg"
              >
                Next
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success btn-lg"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Publishing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-rocket me-2"></i>
                    Publish Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostJob;