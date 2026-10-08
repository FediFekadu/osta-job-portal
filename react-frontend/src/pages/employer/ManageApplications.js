import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../../services/apiService';
import '../../styles/EmployerComponents.css';
const ManageApplications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    job: 'all',
    search: ''
  });
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applications, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsResponse, jobsResponse] = await Promise.all([
        apiService.getEmployerApplications(),
        apiService.getEmployerJobs()
      ]);
      
      setApplications(applicationsResponse.data);
      setJobs(jobsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Filter by job
    if (filters.job !== 'all') {
      filtered = filtered.filter(app => app.job_id === parseInt(filters.job));
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(app => 
        app.applicant_name.toLowerCase().includes(searchLower) ||
        app.applicant_email.toLowerCase().includes(searchLower) ||
        app.job_title.toLowerCase().includes(searchLower)
      );
    }

    setFilteredApplications(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await apiService.updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      reviewing: 'info',
      shortlisted: 'primary',
      interviewed: 'info',
      hired: 'success',
      rejected: 'danger'
    };
    return colors[status] || 'secondary';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="manage-applications-page">
      <div className="page-header">
        <h1>Manage Applications</h1>
        <p>Review and manage job applications from candidates</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="search">Search Applications</label>
            <div className="search-input">
              <i className="fas fa-search"></i>
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, or job title..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="status-filter">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-input"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewed">Interviewed</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="job-filter">Job Position</label>
            <select
              id="job-filter"
              value={filters.job}
              onChange={(e) => handleFilterChange('job', e.target.value)}
              className="form-input"
            >
              <option value="all">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="applications-table">
        <div className="table-header">
          <h2>Applications ({filteredApplications.length})</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job Position</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Resume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    <div className="empty-state">
                      <i className="fas fa-inbox"></i>
                      <p>No applications found matching your criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <div className="applicant-info">
                        <div className="applicant-avatar">
                          <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="applicant-details">
                          <strong>{application.applicant_name}</strong>
                          <span className="applicant-email">{application.applicant_email}</span>
                          <span className="applicant-phone">{application.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="job-info">
                        <strong>{application.job_title}</strong>
                        <span className="department">{application.department_name}</span>
                      </div>
                    </td>
                    <td>{formatDate(application.applied_at)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td>
                      {application.resume_path ? (
                        <a 
                          href={`/uploads/resumes/${application.resume_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-link"
                        >
                          <i className="fas fa-file-pdf"></i>
                          View Resume
                        </a>
                      ) : (
                        <span className="no-resume">No resume</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          to={`/employer/applications/${application.id}`}
                          className="btn btn-sm btn-outline"
                        >
                          <i className="fas fa-eye"></i>
                          View
                        </Link>
                        
                        <div className="status-dropdown">
                          <select
                            value={application.status}
                            onChange={(e) => handleStatusUpdate(application.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewing">Reviewing</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interviewed">Interviewed</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageApplications;