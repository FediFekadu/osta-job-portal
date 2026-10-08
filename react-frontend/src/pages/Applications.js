import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ApplicationsTable from '../components/ApplicationsTable';
import { apiService } from '../services/apiService';
import { Link } from 'react-router-dom';
import '../../styles/ApplicantComponents.css';
const Applications = () => {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, applicationsResponse] = await Promise.all([
        apiService.getUserProfile(),
        apiService.getApplications()
      ]);
      
      setUser(userResponse.data);
      setApplications(applicationsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading applications...</p>
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
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">Track your job application status</p>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Applications ({applications.length})
            </button>
            <button 
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({getStatusCount('pending')})
            </button>
            <button 
              className={`filter-tab ${filter === 'shortlisted' ? 'active' : ''}`}
              onClick={() => setFilter('shortlisted')}
            >
              Shortlisted ({getStatusCount('shortlisted')})
            </button>
            <button 
              className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({getStatusCount('rejected')})
            </button>
          </div>

          <div className="content-card">
            <ApplicationsTable applications={filteredApplications} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
