import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import '../styles/HomePage.css';

const HomePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [featuredJobs, setFeaturedJobs] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [jobsByDepartment, setJobsByDepartment] = useState([]);
    const [stats, setStats] = useState({
        total_jobs: 0,
        total_departments: 0,
        total_applications: 0,
        total_companies: 0
    });
    const [searchForm, setSearchForm] = useState({
        search: '',
        job_type: '',
        department: '',
        location: ''
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [filteredJobs, setFilteredJobs] = useState([]);

    // Mock data for development
    const mockDepartments = [
        { id: 1, name: 'Engineering', icon: 'fa-code', job_count: 45, description: 'Software development and technical roles' },
        { id: 2, name: 'Marketing', icon: 'fa-bullhorn', job_count: 23, description: 'Digital marketing and brand management' },
        { id: 3, name: 'Sales', icon: 'fa-chart-line', job_count: 31, description: 'Business development and client relations' },
        { id: 4, name: 'Human Resources', icon: 'fa-users', job_count: 12, description: 'Talent acquisition and employee relations' },
        { id: 5, name: 'Finance', icon: 'fa-calculator', job_count: 18, description: 'Financial planning and analysis' },
        { id: 6, name: 'Operations', icon: 'fa-cogs', job_count: 27, description: 'Business operations and logistics' },
        { id: 7, name: 'Design', icon: 'fa-palette', job_count: 15, description: 'UI/UX and graphic design' },
        { id: 8, name: 'Customer Support', icon: 'fa-headset', job_count: 20, description: 'Customer service and support' }
    ];

    const mockJobs = [
        {
            id: 1,
            title: 'Senior Software Engineer',
            company: 'TechCorp Inc.',
            location: 'Adama, Ethiopia',
            type: 'Full-time',
            salary: '$120k - $180k',
            featured: true,
            department: 'Engineering',
            posted: '2 days ago'
        },
        {
            id: 2,
            title: 'Product Marketing Manager',
            company: 'StartupXYZ',
            location: 'Bishoftu, Ethiopia',
            type: 'Full-time',
            salary: '$90k - $130k',
            featured: true,
            department: 'Marketing',
            posted: '1 day ago'
        },
        {
            id: 3,
            title: 'UX Designer',
            company: 'Design Studio',
            location: 'Remote',
            type: 'Contract',
            salary: '$70k - $100k',
            featured: false,
            department: 'Design',
            posted: '3 days ago'
        },
        {
            id: 4,
            title: 'Sales Representative',
            company: 'SalesPro Ltd',
            location: 'Addis Ababa, Ethiopia',
            type: 'Full-time',
            salary: '$60k - $90k',
            featured: false,
            department: 'Sales',
            posted: '1 day ago'
        },
        {
            id: 5,
            title: 'DevOps Engineer',
            company: 'CloudTech',
            location: 'Nekemt, Ethiopia',
            type: 'Full-time',
            salary: '$110k - $160k',
            featured: true,
            department: 'Engineering',
            posted: '4 hours ago'
        },
        {
            id: 6,
            title: 'HR Specialist',
            company: 'People First',
            location: 'Bule Hora, Ethiopia',
            type: 'Part-time',
            salary: '$45k - $65k',
            featured: false,
            department: 'Human Resources',
            posted: '2 days ago'
        }
    ];

    useEffect(() => {
        fetchHomePageData();
    }, []);

    const fetchHomePageData = async () => {
        try {
            setLoading(true);
            
            // Try to fetch real data first, fallback to mock data
            try {
                const [statsResponse, deptResponse, jobsResponse] = await Promise.all([
                    apiService.get('/api/stats.php'),
                    apiService.get('/api/departments.php?include_job_count=true'),
                    apiService.get('/api/jobs.php?limit=6&featured=true')
                ]);

                if (statsResponse.data.success) {
                    setStats(statsResponse.data.data || stats);
                } else {
                    // Use mock stats
                    setStats({
                        total_jobs: 156,
                        total_companies: 89,
                        total_applications: 1247,
                        total_departments: 8
                    });
                }

                if (deptResponse.data.success && deptResponse.data.data.length > 0) {
                    setDepartments(deptResponse.data.data);
                } else {
                    setDepartments(mockDepartments);
                }

                if (jobsResponse.data.success && jobsResponse.data.data.length > 0) {
                    setFeaturedJobs(jobsResponse.data.data);
                    setRecentJobs(jobsResponse.data.data);
                } else {
                    setFeaturedJobs(mockJobs.filter(job => job.featured));
                    setRecentJobs(mockJobs);
                }

            } catch (apiError) {
                console.log('API not available, using mock data');
                // Use mock data
                setStats({
                    total_jobs: 156,
                    total_companies: 89,
                    total_applications: 1247,
                    total_departments: 8
                });
                setDepartments(mockDepartments);
                setFeaturedJobs(mockJobs.filter(job => job.featured));
                setRecentJobs(mockJobs);
            }

        } catch (error) {
            console.error('Error fetching homepage data:', error);
            // Fallback to mock data
            setStats({
                total_jobs: 156,
                total_companies: 89,
                total_applications: 1247,
                total_departments: 8
            });
            setDepartments(mockDepartments);
            setFeaturedJobs(mockJobs.filter(job => job.featured));
            setRecentJobs(mockJobs);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const searchParams = new URLSearchParams();
        
        if (searchForm.search) searchParams.append('search', searchForm.search);
        if (searchForm.job_type) searchParams.append('job_type', searchForm.job_type);
        if (searchForm.department) searchParams.append('department', searchForm.department);
        if (searchForm.location) searchParams.append('location', searchForm.location);
        
        navigate(`/browse-jobs?${searchParams.toString()}`);
    };

    const handleInputChange = (e) => {
        setSearchForm({
            ...searchForm,
            [e.target.name]: e.target.value
        });
    };

    const handleJobSave = async (jobId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        try {
            await apiService.post('/api/applicant/save-job.php', { job_id: jobId });
            // Update UI to show job as saved
        } catch (error) {
            console.error('Error saving job:', error);
        }
    };

    const handleJobApply = (jobId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/jobs/${jobId}/apply`);
    };

    const getJobTypeClass = (type) => {
        const typeMap = {
            'full-time': 'full-time',
            'part-time': 'part-time',
            'contract': 'contract',
            'internship': 'internship',
            'temporary': 'temporary'
        };
        return typeMap[type] || 'full-time';
    };

    const formatJobType = (type) => {
        return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatSalary = (min, max, currency = 'USD') => {
        if (!min && !max) return 'Competitive';
        if (min && max) return `${currency} ${min}k - ${max}k`;
        if (min) return `${currency} ${min}k+`;
        return `Up to ${currency} ${max}k`;
    };

    useEffect(() => {
        let filtered = [];
        if (activeTab === 'all') {
            filtered = [...featuredJobs, ...recentJobs];
        } else if (activeTab === 'featured') {
            filtered = featuredJobs;
        } else if (activeTab === 'recent') {
            filtered = recentJobs.slice(0, 4);
        }
        setFilteredJobs(filtered);
    }, [activeTab, featuredJobs, recentJobs]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3">Loading opportunities...</p>
            </div>
        );
    }

    return (
        <div className="homepage">
            {/* Enhanced Navigation - AWS Style Single Line */}
            <nav className="navbar">
                <div className="navbar-container">
                    <Link className="navbar-brand" to="/">
                        <i className="fas fa-briefcase me-2"></i>
                        OSTA Job Portal
                    </Link>
                    
                    <ul className="navbar-nav">
                        <li><Link className="nav-link" to="/browse-jobs">Browse Jobs</Link></li>
                        <li><Link className="nav-link" to="/departments">Departments</Link></li>
                        <li><Link className="nav-link" to="/about">About</Link></li>
                        <li><Link className="nav-link" to="/contact">Contact</Link></li>
                        
                        {user ? (
                            <li className="dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    <i className="fas fa-user-circle me-1"></i>
                                    {user.full_name}
                                </a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to={`/${user.role}/dashboard`}>Dashboard</Link></li>
                                    <li><Link className="dropdown-item" to={`/${user.role}/profile`}>Profile</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><Link className="dropdown-item" to="/logout">Logout</Link></li>
                                </ul>
                            </li>
                        ) : (
                            <>
                                <li><Link className="nav-link" to="/login">Login</Link></li>
                                <li><Link className="nav-link btn-primary" to="/register">Get Started</Link></li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>

            {/* Professional Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10 col-xl-8">
                                <div className="hero-content text-center">
                                    <h1 className="hero-title">
                                        Find Your Perfect Career
                                        <span className="text-primary d-block">in Ethiopia</span>
                                    </h1>
                                    <p className="hero-subtitle">
                                        Discover opportunities with leading employers across all sectors and departments
                                    </p>
                                    
                                    {/* Clean Search Form */}
                                    <div className="hero-search-wrapper">
                                        <form onSubmit={handleSearchSubmit} className="hero-search-form">
                                            <div className="search-container-modern">
                                                <div className="search-input-group">
                                                    <div className="search-field-modern">
                                                        <input
                                                            type="text"
                                                            name="search"
                                                            value={searchForm.search}
                                                            onChange={handleInputChange}
                                                            placeholder="Job title, keywords, or company"
                                                            className="search-input-modern"
                                                        />
                                                    </div>
                                                    
                                                    <div className="search-field-modern">
                                                        <input
                                                            type="text"
                                                            name="location"
                                                            value={searchForm.location}
                                                            onChange={handleInputChange}
                                                            placeholder="Location"
                                                            className="search-input-modern"
                                                        />
                                                    </div>
                                                    
                                                    <div className="search-field-modern">
                                                        <select
                                                            name="department"
                                                            value={searchForm.department}
                                                            onChange={handleInputChange}
                                                            className="search-select-modern"
                                                        >
                                                            <option value="">All Departments</option>
                                                            {departments.map(dept => (
                                                                <option key={dept.id} value={dept.id}>
                                                                    {dept.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    
                                                    <button type="submit" className="search-btn-modern">
                                                        <i className="fas fa-search"></i>
                                                        <span className="btn-text">Search</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                        
                                        {/* Quick Actions */}
                                        <div className="hero-quick-actions">
                                            <Link to="/browse-jobs" className="quick-action-link">
                                                Browse All Jobs
                                            </Link>
                                            <span className="separator">•</span>
                                            <Link to="/departments" className="quick-action-link">
                                                View Departments
                                            </Link>
                                            <span className="separator">•</span>
                                            <Link to="/register" className="quick-action-link">
                                                Create Account
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Clean Stats */}
                                    <div className="hero-stats-modern">
                                        <div className="stat-card">
                                            <div className="stat-number">{stats.total_jobs}+</div>
                                            <div className="stat-label">Active Jobs</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-number">{stats.total_companies}+</div>
                                            <div className="stat-label">Companies</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-number">{stats.total_departments}+</div>
                                            <div className="stat-label">Departments</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Browse Jobs by Department */}
            <section className="section departments-section">
                <div className="container">
                    <div className="section-header-minimal">
                        <h2>Departments</h2>
                        <Link to="/departments" className="view-all-link">
                            View All <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                    </div>
                    
                    <div className="row g-4">
                        {departments.map((dept) => (
                            <div key={dept.id} className="col-lg-3 col-md-6">
                                <Link to={`/jobs?department=${dept.id}`} className="department-card-minimal">
                                    <div className="dept-icon">
                                        <i className={dept.icon}></i>
                                    </div>
                                    <h5>{dept.name}</h5>
                                    <span className="job-count">{dept.job_count} jobs</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Jobs */}
            <section className="section jobs-section-minimal">
                <div className="container">
                    <div className="section-header-minimal">
                        <h2>Latest Jobs</h2>
                        <Link to="/jobs" className="view-all-link">
                            View All <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                    </div>
                    
                    <div className="job-filters-minimal">
                        <div className="filter-tabs">
                            <button 
                                className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveTab('all')}
                            >
                                All
                            </button>
                            <button 
                                className={`filter-tab ${activeTab === 'featured' ? 'active' : ''}`}
                                onClick={() => setActiveTab('featured')}
                            >
                                Featured
                            </button>
                            <button 
                                className={`filter-tab ${activeTab === 'recent' ? 'active' : ''}`}
                                onClick={() => setActiveTab('recent')}
                            >
                                Recent
                            </button>
                        </div>
                    </div>

                    <div className="row g-4">
                        {filteredJobs.map((job) => (
                            <div key={job.id} className="col-lg-4 col-md-6">
                                <div className={`job-card-minimal ${job.featured ? 'featured' : ''}`}>
                                    <div className="job-header-minimal">
                                        {job.featured && <span className="featured-badge">Featured</span>}
                                        <button className="save-btn">
                                            <i className="far fa-bookmark"></i>
                                        </button>
                                    </div>
                                    
                                    <div className="job-content-minimal">
                                        <h4 className="job-title-minimal">{job.title}</h4>
                                        <p className="company-minimal">{job.company}</p>
                                        
                                        <div className="job-meta-minimal">
                                            <span><i className="fas fa-map-marker-alt"></i> {job.location}</span>
                                            <span><i className="fas fa-clock"></i> {formatJobType(job.type)}</span>
                                            <span><i className="fas fa-dollar-sign"></i> {formatSalary(job.salary_min, job.salary_max)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="job-actions-minimal">
                                        <button className="btn-apply" onClick={() => handleJobApply(job.id)}>Apply Now</button>
                                        <button className="btn-details">Details</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action Section */}
            {!user && (
                <section className="cta-section py-5">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <h2>Ready to Start Your Career Journey?</h2>
                                <p className="lead">Join thousands of professionals who have found their dream jobs through OSTA Job Portal</p>
                            </div>
                            <div className="col-lg-4 text-lg-end">
                                <Link to="/register" className="btn btn-primary btn-lg me-3">
                                    <i className="fas fa-user-plus me-2"></i>
                                    Create Account
                                </Link>
                                <Link to="/login" className="btn btn-outline-primary btn-lg">
                                    <i className="fas fa-sign-in-alt me-2"></i>
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* AWS-Style Footer Layout */}
            <footer className="footer bg-dark text-white">
                <div className="container">
                    {/* Main Footer Content - AWS Style */}
                    <div className="footer-content">
                        <div className="row py-4">
                            {/* Job Seekers Column */}
                            <div className="col-lg-3 col-md-6 mb-4">
                                <h6 className="footer-header">Job Seekers</h6>
                                <ul className="footer-column-links">
                                    <li><Link to="/browse-jobs" className="footer-column-link">Browse Jobs</Link></li>
                                    <li><Link to="/register" className="footer-column-link">Create Account</Link></li>
                                    <li><Link to="/applicant/saved-jobs" className="footer-column-link">Saved Jobs</Link></li>
                                    <li><Link to="/applicant/applications" className="footer-column-link">My Applications</Link></li>
                                    <li><Link to="/applicant/profile" className="footer-column-link">Profile</Link></li>
                                    <li><Link to="/applicant/job-alerts" className="footer-column-link">Job Alerts</Link></li>
                                </ul>
                            </div>

                            {/* Employers Column */}
                            <div className="col-lg-3 col-md-6 mb-4">
                                <h6 className="footer-header">Employers</h6>
                                <ul className="footer-column-links">
                                    <li><Link to="/employer/dashboard" className="footer-column-link">Employer Dashboard</Link></li>
                                    <li><Link to="/employer/post-job" className="footer-column-link">Post Jobs</Link></li>
                                    <li><Link to="/employer/applications" className="footer-column-link">Manage Applications</Link></li>
                                    <li><Link to="/employer/profile" className="footer-column-link">Company Profile</Link></li>
                                    <li><span className="footer-column-link text-muted">Contact Admin for New Accounts</span></li>
                                </ul>
                            </div>

                            {/* Resources Column */}
                            <div className="col-lg-3 col-md-6 mb-4">
                                <h6 className="footer-header">Resources</h6>
                                <ul className="footer-column-links">
                                    <li><Link to="/departments" className="footer-column-link">Departments</Link></li>
                                    <li><Link to="/about" className="footer-column-link">About OSTA</Link></li>
                                    <li><Link to="/contact" className="footer-column-link">Contact Us</Link></li>
                                    <li><Link to="/faq" className="footer-column-link">FAQ</Link></li>
                                    <li><Link to="/help" className="footer-column-link">Help Center</Link></li>
                                    <li><Link to="/career-advice" className="footer-column-link">Career Advice</Link></li>
                                </ul>
                            </div>

                            {/* Support & Connect Column */}
                            <div className="col-lg-3 col-md-6 mb-4">
                                <h6 className="footer-header">Support</h6>
                                <ul className="footer-column-links">
                                    <li><Link to="/privacy" className="footer-column-link">Privacy Policy</Link></li>
                                    <li><Link to="/terms" className="footer-column-link">Terms of Service</Link></li>
                                    <li><Link to="/cookies" className="footer-column-link">Cookie Policy</Link></li>
                                    <li><Link to="/login" className="footer-column-link">Login</Link></li>
                                    <li><Link to="/register" className="footer-column-link">Get Started</Link></li>
                                    <li><Link to="/admin/login" className="footer-column-link">Admin Access</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Company Info Section */}
                    <div className="footer-company-info border-top border-secondary pt-4 pb-3">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <div className="footer-brand-section">
                                    <h5 className="text-white mb-2">
                                        <i className="fas fa-briefcase me-2 text-primary"></i>OSTA Job Portal
                                    </h5>
                                    <p className="text-light mb-2 small">
                                        Ethiopia's premier job portal connecting talented professionals with leading employers across all industries and sectors.
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="footer-contact-social">
                                    <div className="contact-info-inline mb-2">
                                        <small className="text-muted me-3">
                                            <i className="fas fa-map-marker-alt me-1"></i>Addis Ababa, Ethiopia
                                        </small>
                                        <small className="text-muted">
                                            <i className="fas fa-envelope me-1"></i>info@osta.gov.et
                                        </small>
                                    </div>
                                    <div className="social-links-inline">
                                        <a href="#" className="social-link-aws me-2" aria-label="Facebook">
                                            <i className="fab fa-facebook-f"></i>
                                        </a>
                                        <a href="#" className="social-link-aws me-2" aria-label="Twitter">
                                            <i className="fab fa-twitter"></i>
                                        </a>
                                        <a href="#" className="social-link-aws me-2" aria-label="LinkedIn">
                                            <i className="fab fa-linkedin-in"></i>
                                        </a>
                                        <a href="#" className="social-link-aws" aria-label="Instagram">
                                            <i className="fab fa-instagram"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="footer-bottom-aws border-top border-secondary pt-3 pb-2">
                        <div className="text-center">
                            <small className="text-muted">
                                &copy; {new Date().getFullYear()} OSTA Job Portal. All rights reserved.
                            </small>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
