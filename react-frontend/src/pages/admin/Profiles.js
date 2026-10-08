import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0
  });

  const statusConfig = {
    active: { color: '#10b981', bg: '#ecfdf5', label: 'Active' },
    inactive: { color: '#ef4444', bg: '#fef2f2', label: 'Inactive' },
    pending: { color: '#f59e0b', bg: '#fffbeb', label: 'Pending' },
    suspended: { color: '#6b7280', bg: '#f9fafb', label: 'Suspended' }
  };

  const roleConfig = {
    applicant: { color: '#3b82f6', bg: '#eff6ff', icon: 'fas fa-user', label: 'Applicant' },
    employer: { color: '#8b5cf6', bg: '#f5f3ff', icon: 'fas fa-building', label: 'Employer' },
    admin: { color: '#ef4444', bg: '#fef2f2', icon: 'fas fa-shield-alt', label: 'Admin' }
  };

  useEffect(() => {
    fetchProfiles();
    fetchStats();
  }, [filter, searchTerm, sortBy, sortOrder]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getProfiles({
        filter,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getProfileStats();
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const viewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowModal(true);
  };

  const updateProfileStatus = async (profileId, status) => {
    try {
      await apiService.updateProfileStatus(profileId, status);
      fetchProfiles();
      fetchStats();
      setShowModal(false);
      setSuccess(`Profile ${status} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile status:', error);
      setError('Failed to update profile status');
    }
  };

  const verifyProfile = async (profileId) => {
    try {
      await apiService.verifyProfile(profileId);
      fetchProfiles();
      fetchStats();
      setSuccess('Profile verified successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to verify profile');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedProfiles.length === 0) {
      setError('Please select profiles first');
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedProfiles.length} profile(s)?`)) return;

    try {
      await apiService.bulkProfileAction(action, selectedProfiles);
      setSelectedProfiles([]);
      fetchProfiles();
      fetchStats();
      setSuccess(`Bulk ${action} completed successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(`Failed to ${action} profiles`);
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProfiles(paginatedProfiles.map(p => p.id));
    } else {
      setSelectedProfiles([]);
    }
  };

  const handleSelectProfile = (profileId, checked) => {
    if (checked) {
      setSelectedProfiles([...selectedProfiles, profileId]);
    } else {
      setSelectedProfiles(selectedProfiles.filter(id => id !== profileId));
    }
  };

  const exportProfiles = async (format) => {
    try {
      const response = await apiService.exportProfiles({
        format,
        filter,
        search: searchTerm,
        selected: selectedProfiles.length > 0 ? selectedProfiles : null
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'text/csv' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profiles-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(`Profiles exported successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to export profiles');
    }
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return {
      color: config.color,
      backgroundColor: config.bg,
      label: config.label
    };
  };

  const getRoleBadge = (role) => {
    const config = roleConfig[role] || roleConfig.applicant;
    return {
      color: config.color,
      backgroundColor: config.bg,
      icon: config.icon,
      label: config.label
    };
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'verified') return matchesSearch && profile.verified;
    if (filter === 'unverified') return matchesSearch && !profile.verified;
    return matchesSearch && (profile.role === filter || profile.status === filter);
  });

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const loginDate = new Date(dateString);
    const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Modern Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2>User Profiles</h2>
            <p>Manage user accounts and permissions</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-outline"
              onClick={() => exportProfiles('csv')}
            >
              <i className="fas fa-download"></i>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-content">
            <div className="stat-number">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-pause-circle"></i>
          </div>
        </div>
        <div className="stat-card verified">
          <div className="stat-content">
            <div className="stat-number">{stats.verified}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-icon">
            <i className="fas fa-shield-check"></i>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="controls-panel">
        <div className="search-section">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="filter-section">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="applicant">Applicants</option>
            <option value="employer">Employers</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
        
        <div className="sort-section">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Date Joined</option>
            <option value="full_name">Name</option>
            <option value="email">Email</option>
            <option value="last_login">Last Login</option>
          </select>
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-toggle"
          >
            <i className={`fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
          </button>
        </div>
        
        {selectedProfiles.length > 0 && (
          <div className="bulk-actions">
            <span className="selection-count">
              {selectedProfiles.length} selected
            </span>
            <button 
              onClick={() => handleBulkAction('activate')}
              className="btn btn-sm btn-success"
            >
              Activate
            </button>
            <button 
              onClick={() => handleBulkAction('deactivate')}
              className="btn btn-sm btn-warning"
            >
              Deactivate
            </button>
            <button 
              onClick={() => handleBulkAction('verify')}
              className="btn btn-sm btn-primary"
            >
              Verify
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="data-table">
        <div className="table-header">
          <div className="table-row">
            <div className="table-cell checkbox-cell">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={selectedProfiles.length === paginatedProfiles.length && paginatedProfiles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>
            <div className="table-cell">User</div>
            <div className="table-cell">Role</div>
            <div className="table-cell">Status</div>
            <div className="table-cell">Last Login</div>
            <div className="table-cell">Joined</div>
            <div className="table-cell">Actions</div>
          </div>
        </div>
        
        <div className="table-body">
          {paginatedProfiles.map((profile) => {
            const statusBadge = getStatusBadge(profile.status);
            const roleBadge = getRoleBadge(profile.role);
            
            return (
              <div key={profile.id} className="table-row">
                <div className="table-cell checkbox-cell">
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={(e) => handleSelectProfile(profile.id, e.target.checked)}
                    />
                    <span className="checkmark"></span>
                  </label>
                </div>
                
                <div className="table-cell user-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      <i className={roleBadge.icon}></i>
                    </div>
                    <div className="user-details">
                      <div className="user-name">{profile.full_name}</div>
                      <div className="user-email">{profile.email}</div>
                    </div>
                  </div>
                </div>
                
                <div className="table-cell">
                  <span 
                    className="role-badge"
                    style={{
                      color: roleBadge.color,
                      backgroundColor: roleBadge.backgroundColor
                    }}
                  >
                    <i className={roleBadge.icon}></i>
                    {roleBadge.label}
                  </span>
                </div>
                
                <div className="table-cell">
                  <div className="status-wrapper">
                    <span 
                      className="status-badge"
                      style={{
                        color: statusBadge.color,
                        backgroundColor: statusBadge.backgroundColor
                      }}
                    >
                      {statusBadge.label}
                    </span>
                    {profile.verified && (
                      <span className="verified-indicator" title="Verified">
                        <i className="fas fa-shield-check"></i>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="table-cell">
                  <span className="last-login">
                    {formatLastLogin(profile.last_login)}
                  </span>
                </div>
                
                <div className="table-cell">
                  <span className="join-date">
                    {formatDate(profile.created_at)}
                  </span>
                </div>
                
                <div className="table-cell actions-cell">
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => viewProfile(profile)}
                      title="View Profile"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    {!profile.verified && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => verifyProfile(profile.id)}
                        title="Verify Profile"
                      >
                        <i className="fas fa-shield-check"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Profile Modal */}
      {showModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Profile Details</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedProfile.full_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedProfile.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedProfile.phone || 'Not provided'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Role:</label>
                      <span>{selectedProfile.role}</span>
                    </div>
                    <div className="detail-item">
                      <label>Status:</label>
                      <span>{selectedProfile.status}</span>
                    </div>
                    <div className="detail-item">
                      <label>Joined:</label>
                      <span>{formatDate(selectedProfile.created_at)}</span>
                    </div>
                  </div>
                </div>

                {selectedProfile.role === 'applicant' && (
                  <div className="detail-section">
                    <h4>Applicant Details</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Skills:</label>
                        <span>{selectedProfile.skills || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Experience:</label>
                        <span>{selectedProfile.experience || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Education:</label>
                        <span>{selectedProfile.education || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedProfile.role === 'employer' && (
                  <div className="detail-section">
                    <h4>Employer Details</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <label>Company:</label>
                        <span>{selectedProfile.company_name || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Industry:</label>
                        <span>{selectedProfile.industry || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <label>Website:</label>
                        <span>{selectedProfile.website || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => updateProfileStatus(selectedProfile.id, 'active')}
                className="btn btn-success"
              >
                <i className="fas fa-check"></i>
                Activate
              </button>
              <button 
                onClick={() => updateProfileStatus(selectedProfile.id, 'inactive')}
                className="btn btn-warning"
              >
                <i className="fas fa-pause"></i>
                Deactivate
              </button>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
