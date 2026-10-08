import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const Home = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    job_type: '',
    department_id: ''
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, departmentsResponse] = await Promise.all([
        apiService.getJobs({ limit: 6 }), // Featured jobs
        apiService.getDepartments()
      ]);

      if (jobsResponse.success) {
        setJobs(jobsResponse.data);
      }

      if (departmentsResponse.success) {
        setDepartments(departmentsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to browse jobs with filters
    const params = new URLSearchParams(filters);
    window.location.href = `/browse-jobs?${params.toString()}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Find Your Future Career at OSTA & Partners</h1>
            <p>Connecting skilled professionals with opportunities across Oromia</p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hero-search">
              <div className="search-row">
                <div className="search-field">
                  <label>Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g., Engineer, Manager..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                
                <div className="search-field">
                  <label>Job Type</label>
                  <select
                    value={filters.job_type}
                    onChange={(e) => setFilters({...filters, job_type: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div className="search-field">
                  <label>Department</label>
                  <select
                    value={filters.department_id}
                    onChange={(e) => setFilters({...filters, department_id: e.target.value})}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="search-btn">
                  <i className="fas fa-search"></i>
                  Search Jobs
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="featured-jobs">
        <div className="container">
          <h2>Featured Jobs / Recent Openings</h2>
          <p>Discover exciting career opportunities with OSTA and partner organizations</p>
          
          {loading ? (
            <div className="loading-screen">
              <div className="loading-spinner"></div>
              <p>Loading jobs...</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <span className={`job-type ${job.employment_type}`}>
                      {job.employment_type.replace('_', ' ')}
                    </span>
                    {job.salary_range && (
                      <span className="salary-badge">
                        <i className="fas fa-money-bill-wave"></i>
                        {job.salary_range}
                      </span>
                    )}
                  </div>
                  
                  <h3>{job.title}</h3>
                  
                  <div className="job-meta">
                    <div><i className="fas fa-building"></i> {job.department_name}</div>
                    <div><i className="fas fa-map-marker-alt"></i> {job.location}</div>
                    <div><i className="fas fa-clock"></i> Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
                  </div>
                  
                  <p>{job.description.substring(0, 120)}...</p>
                  
                  <div className="job-actions">
                    {user && user.role === 'applicant' ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = `/applicant/apply?job_id=${job.id}`}
                      >
                        Apply Now
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={() => window.location.href = '/login'}
                      >
                        Login to Apply
                      </button>
                    )}
                    <button 
                      className="btn btn-outline"
                      onClick={() => window.location.href = `/job-details/${job.id}`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How to Apply */}
      <section className="how-to-apply">
        <div className="container">
          <h2>How to Apply</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Browse Jobs</h3>
              <p>Explore our comprehensive job listings and find positions that match your skills.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Register/Login</h3>
              <p>Create your account or login to access our application system.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Fill Application</h3>
              <p>Complete your application with your resume and cover letter.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Wait for Response</h3>
              <p>Track your application status and receive notifications.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;