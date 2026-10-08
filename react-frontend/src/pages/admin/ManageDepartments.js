import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDepartments();
      // Ensure we always set an array
      const departmentsData = response.data || response || [];
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingDepartment) {
        await apiService.updateDepartment(editingDepartment.id, formData);
        setSuccess('Department updated successfully');
      } else {
        await apiService.createDepartment(formData);
        setSuccess('Department created successfully');
      }
      
      setFormData({ name: '', description: '' });
      setShowCreateModal(false);
      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await apiService.deleteDepartment(id);
        setSuccess('Department deleted successfully');
        fetchDepartments();
      } catch (error) {
        setError('Failed to delete department');
      }
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <i className="fas fa-building"></i>
          Departments
        </h1>
        <p className="admin-page-subtitle">Organize and manage company departments</p>
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

      {/* Search and Actions Card */}
      <div className="admin-card admin-mb-4">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-search"></i>
            Search & Actions
          </h2>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus"></i>
            Add Department
          </button>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-group">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-form-control"
            />
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-list"></i>
            Departments List
          </h2>
          <span className="badge badge-info">{filteredDepartments.length} departments</span>
        </div>
        <div className="admin-card-body">
          {filteredDepartments.length === 0 ? (
            <div className="admin-text-center admin-mb-4">
              <div className="admin-mb-3">
                <i className="fas fa-building" style={{fontSize: '3rem', color: 'var(--admin-border-medium)'}}></i>
              </div>
              <h3 className="admin-mb-2">No departments found</h3>
              <p className="admin-mb-3">Create your first department to get started</p>
              <button 
                className="admin-btn admin-btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <i className="fas fa-plus"></i>
                Add Department
              </button>
            </div>
          ) : (
            <div className="admin-stats-grid">
              {filteredDepartments.map((department) => (
                <div key={department.id} className="admin-stat-card">
                  <div className="admin-stat-header">
                    <h3 className="admin-stat-title">{department.name}</h3>
                    <div className="admin-stat-icon">
                      <i className="fas fa-building"></i>
                    </div>
                  </div>
                  <p className="admin-mb-3" style={{fontSize: 'var(--admin-font-size-sm)', color: 'var(--admin-primary-light)'}}>
                    {department.description || 'No description provided'}
                  </p>
                  
                  <div className="admin-d-flex admin-justify-between admin-mb-3">
                    <div className="admin-text-center">
                      <div className="admin-stat-value" style={{fontSize: 'var(--admin-font-size-lg)'}}>{department.job_count || 0}</div>
                      <small style={{color: 'var(--admin-primary-light)'}}>Active Jobs</small>
                    </div>
                    <div className="admin-text-center">
                      <div className="admin-stat-value" style={{fontSize: 'var(--admin-font-size-lg)'}}>{department.employee_count || 0}</div>
                      <small style={{color: 'var(--admin-primary-light)'}}>Employees</small>
                    </div>
                  </div>
                  
                  <div className="admin-d-flex admin-gap-2">
                    <button 
                      className="admin-btn admin-btn-sm admin-btn-outline"
                      onClick={() => {
                        setEditingDepartment(department);
                        setFormData({ name: department.name, description: department.description || '' });
                        setShowCreateModal(true);
                      }}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button 
                      className="admin-btn admin-btn-sm admin-btn-danger"
                      onClick={() => handleDeleteDepartment(department.id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Department Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fas fa-building"></i>
                {editingDepartment ? 'Edit Department' : 'Create Department'}
              </h3>
              <button 
                className="admin-btn-close"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingDepartment(null);
                  setFormData({ name: '', description: '' });
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Department Name *</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-control"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional department description"
                  ></textarea>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button 
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingDepartment(null);
                    setFormData({ name: '', description: '' });
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <i className="fas fa-save"></i>
                  {editingDepartment ? 'Update' : 'Create'} Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Department Modal Component
const DepartmentModal = ({ department, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: department?.name || '',
    description: department?.description || '',
    manager_email: department?.manager_email || '',
    budget: department?.budget || '',
    location: department?.location || ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    
    if (formData.manager_email && !/\S+@\S+\.\S+/.test(formData.manager_email)) {
      newErrors.manager_email = 'Please enter a valid email address';
    }

    if (formData.budget && isNaN(formData.budget)) {
      newErrors.budget = 'Budget must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      if (department) {
        // Update existing department
        await apiService.updateDepartment(department.id, formData);
      } else {
        // Create new department
        await apiService.createDepartment(formData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving department:', error);
      setErrors({ submit: 'Failed to save department. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{department ? 'Edit Department' : 'Create New Department'}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.submit && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Department Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter department name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Describe the department's role and responsibilities"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="manager_email">Manager Email</label>
              <input
                type="email"
                id="manager_email"
                name="manager_email"
                value={formData.manager_email}
                onChange={handleChange}
                className={`form-input ${errors.manager_email ? 'error' : ''}`}
                placeholder="manager@company.com"
              />
              {errors.manager_email && <span className="error-text">{errors.manager_email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="Office location or floor"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="budget">Annual Budget</label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className={`form-input ${errors.budget ? 'error' : ''}`}
              placeholder="0"
              min="0"
              step="1000"
            />
            {errors.budget && <span className="error-text">{errors.budget}</span>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {department ? 'Update Department' : 'Create Department'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageDepartments;
