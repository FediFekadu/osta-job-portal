import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [job, setJob] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: 'full_time',
    salary_range: '',
    deadline: '',
    department_id: ''
  });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobAndDepartments();
  }, [id]);

  const fetchJobAndDepartments = async () => {
    try {
      setLoading(true);
      const [jobResponse, departmentsResponse] = await Promise.all([
        apiService.getJob(id),
        apiService.getDepartments()
      ]);

      if (jobResponse.success) {
        setJob(jobResponse.data);
      }

      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.data);
      }
    } catch (error) {
      setError('Failed to load job details');
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await apiService.updateJob(id, job);
      
      if (response.success) {
        navigate('/employer/dashboard');
      } else {
        setError(response.message || 'Failed to update job');
      }
    } catch (error) {
      setError('Failed to update job');
      console.error('Error updating job:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="edit-job-page">
      <div className="page-header">
        <h1>Edit Job Posting</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/employer/dashboard')}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-section">
          <h3>Job Information</h3>
          
          <div className="form-group">
            <label htmlFor="title">Job Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={job.title}
              onChange={handleChange}
              required
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department_id">Department *</label>
              <select
                id="department_id"
                name="department_id"
                value={job.department_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="employment_type">Employment Type *</label>
              <select
                id="employment_type"
                name="employment_type"
                value={job.employment_type}
                onChange={handleChange}
                required
              >
                <option value="full_time">Full-time</option>
                <option value="part_time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={job.location}
                onChange={handleChange}
                required
                placeholder="e.g., Addis Ababa, Ethiopia"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary_range">Salary Range</label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={job.salary_range}
                onChange={handleChange}
                placeholder="e.g., 15,000 - 25,000 ETB"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Application Deadline *</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={job.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Job Details</h3>
          
          <div className="form-group">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={job.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requirements *</label>
            <textarea
              id="requirements"
              name="requirements"
              value={job.requirements}
              onChange={handleChange}
              required
              rows="6"
              placeholder="List the required qualifications, skills, experience, and education..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/employer/dashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="btn-spinner"></div>
                Updating...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Update Job
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
