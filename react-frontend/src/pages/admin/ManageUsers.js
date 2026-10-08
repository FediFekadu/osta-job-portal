import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    employers: 0,
    applicants: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [users, filters, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const inactive = users.filter(u => u.status === 'inactive').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const employers = users.filter(u => u.role === 'employer').length;
    const applicants = users.filter(u => u.role === 'applicant').length;

    setStats({ total, active, inactive, admins, employers, applicants });
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Filter by role
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(user => 
        new Date(user.created_at) >= filterDate
      );
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await apiService.deleteUser(userId);
        setUsers(prev => prev.filter(user => user.id !== userId));
        setSuccess('User deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user. Please try again.');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await apiService.updateUser(userId, { status: newStatus });
      setUsers(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );
      setSuccess(`User status updated to ${newStatus}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      setError('Please select users to perform bulk action');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedUsers.length} selected user(s)?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      for (const userId of selectedUsers) {
        if (action === 'delete') {
          await apiService.deleteUser(userId);
        } else if (action === 'activate') {
          await apiService.updateUser(userId, { status: 'active' });
        } else if (action === 'deactivate') {
          await apiService.updateUser(userId, { status: 'inactive' });
        }
      }

      if (action === 'delete') {
        setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      } else {
        const newStatus = action === 'activate' ? 'active' : 'inactive';
        setUsers(prev => 
          prev.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, status: newStatus }
              : user
          )
        );
      }

      setSelectedUsers([]);
      setSuccess(`Bulk ${action} completed successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setError(`Failed to perform bulk ${action}. Please try again.`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    const currentPageUsers = getCurrentPageUsers().map(user => user.id);
    const allSelected = currentPageUsers.every(id => selectedUsers.includes(id));
    
    if (allSelected) {
      setSelectedUsers(prev => prev.filter(id => !currentPageUsers.includes(id)));
    } else {
      setSelectedUsers(prev => [...new Set([...prev, ...currentPageUsers])]);
    }
  };

  const exportUsers = () => {
    const dataToExport = filteredUsers.map(user => ({
      ID: user.id,
      Username: user.username,
      Email: user.email,
      'Full Name': user.full_name || '',
      Role: user.role,
      Status: user.status,
      'Created At': formatDate(user.created_at),
      'Last Login': user.last_login ? formatDate(user.last_login) : 'Never'
    }));

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getCurrentPageUsers = () => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'danger',
      employer: 'primary',
      applicant: 'success'
    };
    return colors[role] || 'secondary';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'warning';
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
          Users
        </h1>
        <p className="admin-page-subtitle">Manage system users and their permissions</p>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="admin-alert admin-alert-danger">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-bg-primary">
            <i className="fas fa-users"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-bg-success">
            <i className="fas fa-user-check"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.active}</h3>
            <p>Active Users</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-bg-warning">
            <i className="fas fa-user-times"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.inactive}</h3>
            <p>Inactive Users</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon admin-bg-info">
            <i className="fas fa-user-tie"></i>
          </div>
          <div className="admin-stat-content">
            <h3>{stats.employers}</h3>
            <p>Employers</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-filter"></i>
            Filters & Actions
          </h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-filters-row">
            <div className="admin-filter-group">
              <label>Search Users</label>
              <div className="admin-input-group">
                <i className="fas fa-search admin-input-icon"></i>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Search by name, email, or username..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-filter-group">
              <label>Role</label>
              <select
                className="admin-form-control"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="employer">Employer</option>
                <option value="applicant">Applicant</option>
              </select>
            </div>
            <div className="admin-filter-group">
              <label>Status</label>
              <select
                className="admin-form-control"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="admin-filter-group">
              <label>Date Range</label>
              <select
                className="admin-form-control"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="admin-actions-row">
            <div className="admin-bulk-actions">
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-user-plus"></i>
                Create User
              </button>
              <button
                className="admin-btn admin-btn-success"
                onClick={exportUsers}
                disabled={filteredUsers.length === 0}
              >
                <i className="fas fa-download"></i>
                Export CSV
              </button>
            </div>

            {selectedUsers.length > 0 && (
              <div className="admin-bulk-actions">
                <span className="admin-selected-count">
                  {selectedUsers.length} selected
                </span>
                <button
                  className="admin-btn admin-btn-success admin-btn-sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  <i className="fas fa-check"></i>
                  Activate
                </button>
                <button
                  className="admin-btn admin-btn-warning admin-btn-sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <i className="fas fa-pause"></i>
                  Deactivate
                </button>
                <button
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <i className="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-table"></i>
            Users ({filteredUsers.length})
          </h2>
        </div>
        <div className="admin-card-body">
          {filteredUsers.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fas fa-users admin-empty-icon"></i>
              <h3>No Users Found</h3>
              <p>No users match your current filters. Try adjusting your search criteria.</p>
            </div>
          ) : (
            <>
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={getCurrentPageUsers().length > 0 && getCurrentPageUsers().every(user => selectedUsers.includes(user.id))}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="admin-sortable"
                        onClick={() => handleSort('full_name')}
                      >
                        User
                        {sortConfig.key === 'full_name' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th 
                        className="admin-sortable"
                        onClick={() => handleSort('role')}
                      >
                        Role
                        {sortConfig.key === 'role' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th 
                        className="admin-sortable"
                        onClick={() => handleSort('status')}
                      >
                        Status
                        {sortConfig.key === 'status' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th 
                        className="admin-sortable"
                        onClick={() => handleSort('created_at')}
                      >
                        Created
                        {sortConfig.key === 'created_at' && (
                          <i className={`fas fa-sort-${sortConfig.direction === 'asc' ? 'up' : 'down'}`}></i>
                        )}
                      </th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentPageUsers().map((user) => (
                      <tr key={user.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td>
                          <div className="admin-d-flex admin-align-center">
                            <div className="admin-user-avatar">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="admin-ml-3">
                              <div className="admin-font-weight-bold">{user.full_name || user.username}</div>
                              <div className="admin-text-muted admin-font-size-sm">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${getRoleColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${getStatusColor(user.status)}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className="admin-text-muted admin-font-size-sm">
                            {user.created_at ? formatDate(user.created_at) : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className="admin-text-muted admin-font-size-sm">
                            {user.last_login ? formatDate(user.last_login) : 'Never'}
                          </span>
                        </td>
                        <td>
                          <div className="admin-d-flex admin-gap-2">
                            <button
                              className="admin-btn admin-btn-sm admin-btn-info"
                              onClick={() => viewUserDetails(user)}
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className={`admin-btn admin-btn-sm ${user.status === 'active' ? 'admin-btn-warning' : 'admin-btn-success'}`}
                              onClick={() => handleStatusToggle(user.id, user.status)}
                              title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                            >
                              <i className={`fas ${user.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                            </button>
                            <button
                              className="admin-btn admin-btn-sm admin-btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                    Previous
                  </button>
                  
                  <span className="admin-pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="admin-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fas fa-user"></i>
                User Details
              </h3>
              <button 
                className="admin-btn-close"
                onClick={() => setShowUserModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-user-details">
                <div className="admin-detail-section">
                  <h4>Basic Information</h4>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <label>Full Name</label>
                      <span>{selectedUser.full_name || 'Not provided'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Username</label>
                      <span>{selectedUser.username}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Email</label>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Role</label>
                      <span className={`badge badge-${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Status</label>
                      <span className={`badge badge-${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </span>
                    </div>
                    <div className="admin-detail-item">
                      <label>User ID</label>
                      <span>{selectedUser.id}</span>
                    </div>
                  </div>
                </div>

                <div className="admin-detail-section">
                  <h4>Account Information</h4>
                  <div className="admin-detail-grid">
                    <div className="admin-detail-item">
                      <label>Created At</label>
                      <span>{selectedUser.created_at ? formatDate(selectedUser.created_at) : 'N/A'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Last Login</label>
                      <span>{selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never'}</span>
                    </div>
                    <div className="admin-detail-item">
                      <label>Updated At</label>
                      <span>{selectedUser.updated_at ? formatDate(selectedUser.updated_at) : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button 
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
              <button 
                type="button"
                className={`admin-btn ${selectedUser.status === 'active' ? 'admin-btn-warning' : 'admin-btn-success'}`}
                onClick={() => {
                  handleStatusToggle(selectedUser.id, selectedUser.status);
                  setShowUserModal(false);
                }}
              >
                <i className={`fas ${selectedUser.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                {selectedUser.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fas fa-user-plus"></i>
                Create New User
              </h3>
              <button 
                className="admin-btn-close"
                onClick={() => setShowCreateModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-text-center admin-text-muted">
                <i className="fas fa-tools admin-mb-3" style={{fontSize: '3rem', opacity: 0.5}}></i>
                <h4>Coming Soon</h4>
                <p>User creation functionality will be implemented in the next update.</p>
                <p>Currently, users can self-register as applicants, and admins can create employer accounts through the dedicated Create Employer feature.</p>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button 
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setShowCreateModal(false)}
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

export default ManageUsers;
