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
      setSelectedProfiles(profiles.map(p => p.id));
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
      <div className="admin-content">
        <div className="admin-text-center admin-mt-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-users"></i>
          User Profiles
        </h1>
        <p className="admin-page-subtitle">Manage and review user profiles across the platform</p>
        <div className="admin-page-actions">
          <button
            className="admin-btn admin-btn-outline"
            onClick={() => exportProfiles('pdf')}
          >
            <i className="fas fa-file-pdf"></i>
            Export PDF
          </button>
          <button
            className="admin-btn admin-btn-outline"
            onClick={() => exportProfiles('excel')}
          >
            <i className="fas fa-file-excel"></i>
            Export Excel
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="admin-alert admin-alert-success admin-mb-4">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      {error && (
        <div className="admin-alert admin-alert-danger admin-mb-4">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-row admin-mb-4">
        <div className="admin-col-md-3">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-primary">
              <i className="fas fa-users"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.total}</h3>
              <p>Total Profiles</p>
            </div>
          </div>
        </div>
        <div className="admin-col-md-3">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-success">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.active}</h3>
              <p>Active Users</p>
            </div>
          </div>
        </div>
        <div className="admin-col-md-3">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-warning">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.inactive}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
        </div>
        <div className="admin-col-md-3">
          <div className="admin-stats-card">
            <div className="admin-stats-icon admin-bg-info">
              <i className="fas fa-shield-check"></i>
            </div>
            <div className="admin-stats-content">
              <h3>{stats.verified}</h3>
              <p>Verified Profiles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls and Filters */}
      <div className="admin-card admin-mb-4">
        <div className="admin-card-body">
          <div className="admin-row admin-align-center">
            <div className="admin-col-md-4">
              <div className="admin-search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-col-md-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="admin-form-control"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-col-md-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-form-control"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="admin-col-md-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="admin-form-control"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="admin-col-md-2">
              <div className="admin-view-toggle">
                <button
                  className={`admin-btn admin-btn-sm ${viewMode === 'grid' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={`admin-btn admin-btn-sm ${viewMode === 'list' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProfiles.length > 0 && (
        <div className="admin-card admin-mb-4">
          <div className="admin-card-body">
            <div className="admin-d-flex admin-justify-between admin-align-center">
              <span>{selectedProfiles.length} profile(s) selected</span>
              <div className="admin-d-flex admin-gap-2">
                <button
                  className="admin-btn admin-btn-outline admin-btn-success"
                  onClick={() => handleBulkAction('activate')}
                >
                  <i className="fas fa-check"></i>
                  Activate Selected
                </button>
                <button
                  className="admin-btn admin-btn-outline admin-btn-warning"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <i className="fas fa-times"></i>
                  Deactivate Selected
                </button>
                <button
                  className="admin-btn admin-btn-outline admin-btn-info"
                  onClick={() => handleBulkAction('verify')}
                >
                  <i className="fas fa-shield-check"></i>
                  Verify Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profiles Display */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-d-flex admin-justify-between admin-align-center">
            <h3>Profiles ({profiles.length})</h3>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                className="admin-checkbox"
                checked={selectedProfiles.length === profiles.length && profiles.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="admin-ml-2">Select All</span>
            </label>
          </div>
        </div>
        <div className="admin-card-body admin-p-0">
          {profiles.length === 0 ? (
            <div className="admin-text-center admin-py-5">
              <i className="fas fa-users admin-text-muted" style={{fontSize: '3rem'}}></i>
              <p className="admin-text-muted admin-mt-3">No profiles found</p>
            </div>
          ) : (
            <div className={`admin-profiles-${viewMode}`}>
              {profiles.map(profile => (
                <div
                  key={profile.id}
                  className={`admin-profile-item ${selectedProfiles.includes(profile.id) ? 'selected' : ''}`}
                >
                  <div className="admin-profile-checkbox">
                    <input
                      type="checkbox"
                      className="admin-checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={(e) => handleSelectProfile(profile.id, e.target.checked)}
                    />
                  </div>
                  <div className="admin-profile-avatar">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt={profile.full_name} className="admin-avatar-img" />
                    ) : (
                      <div className="admin-avatar-placeholder">
                        <i className={getRoleIcon(profile.role)}></i>
                      </div>
                    )}
                  </div>
                  <div className="admin-profile-info">
                    <h4 className="admin-profile-name">{profile.full_name}</h4>
                    <p className="admin-profile-email">{profile.email}</p>
                    <div className="admin-profile-meta">
                      <span className={`admin-badge admin-badge-${getStatusColor(profile.status)}`}>
                        {profile.status}
                      </span>
                      <span className="admin-badge admin-badge-secondary">
                        <i className={getRoleIcon(profile.role)}></i>
                        {profile.role}
                      </span>
                      {profile.verified && (
                        <span className="admin-badge admin-badge-success">
                          <i className="fas fa-shield-check"></i>
                          Verified
                        </span>
                      )}
                    </div>
                    <small className="admin-text-muted">
                      <i className="fas fa-calendar"></i>
                      Joined: {new Date(profile.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="admin-profile-actions">
                    <button
                      className="admin-btn admin-btn-sm admin-btn-outline"
                      onClick={() => viewProfile(profile)}
                    >
                      <i className="fas fa-eye"></i>
                      View
                    </button>
                    {!profile.verified && (
                      <button
                        className="admin-btn admin-btn-sm admin-btn-outline admin-btn-success"
                        onClick={() => verifyProfile(profile.id)}
                      >
                        <i className="fas fa-shield-check"></i>
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      {showModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Profile Details</h2>
              <button onClick={() => setShowModal(false)} className="btn-close">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="profile-details">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <p><strong>Name:</strong> {selectedProfile.full_name}</p>
                  <p><strong>Email:</strong> {selectedProfile.email}</p>
                  <p><strong>Phone:</strong> {selectedProfile.phone || 'Not provided'}</p>
                  <p><strong>Role:</strong> {selectedProfile.role}</p>
                  <p><strong>Status:</strong> {selectedProfile.status}</p>
                  <p><strong>Joined:</strong> {new Date(selectedProfile.created_at).toLocaleDateString()}</p>
                </div>

                {selectedProfile.role === 'applicant' && (
                  <div className="detail-section">
                    <h4>Applicant Details</h4>
                    <p><strong>Skills:</strong> {selectedProfile.skills || 'Not specified'}</p>
                    <p><strong>Experience:</strong> {selectedProfile.experience || 'Not specified'}</p>
                    <p><strong>Education:</strong> {selectedProfile.education || 'Not specified'}</p>
                  </div>
                )}

                {selectedProfile.role === 'employer' && (
                  <div className="detail-section">
                    <h4>Employer Details</h4>
                    <p><strong>Company:</strong> {selectedProfile.company_name || 'Not specified'}</p>
                    <p><strong>Industry:</strong> {selectedProfile.industry || 'Not specified'}</p>
                    <p><strong>Website:</strong> {selectedProfile.website || 'Not specified'}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => updateProfileStatus(selectedProfile.id, 'active')}
                className="btn-activate"
              >
                Activate
              </button>
              <button 
                onClick={() => updateProfileStatus(selectedProfile.id, 'inactive')}
                className="btn-deactivate"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles;
