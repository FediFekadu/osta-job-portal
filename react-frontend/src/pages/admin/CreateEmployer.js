import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const CreateEmployer = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    address: '',
    department_id: '',
    contact_person: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showCredentials, setShowCredentials] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchDepartments = async () => {
    try {
      const response = await apiService.getDepartments();
      const departmentsData = response.data || response || [];
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const generateDefaultCredentials = (companyName) => {
    const cleanName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const email = `${cleanName}@company.com`;
    const password = `${cleanName}123`;
    return { email, password };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required';
    }
    
    if (!formData.contact_person.trim()) {
      errors.contact_person = 'Contact person is required';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Auto-generate email when company name changes
    if (name === 'company_name' && value) {
      const credentials = generateDefaultCredentials(value);
      setFormData(prev => ({
        ...prev,
        email: credentials.email
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Generate credentials
      const credentials = generateDefaultCredentials(formData.company_name);
      
      // Create employer account
      const employerData = {
        ...formData,
        email: credentials.email,
        password: credentials.password,
        role: 'employer'
      };

      const response = await apiService.post('/api/admin/create-employer.php', employerData);

      if (response.data.success) {
        setSuccess('Employer account created successfully!');
        setGeneratedCredentials(credentials);
        setShowCredentials(true);
        setFormData({
          company_name: '',
          email: '',
          phone: '',
          address: '',
          department_id: '',
          contact_person: ''
        });
        setValidationErrors({});
      } else {
        setError(response.data.message || 'Failed to create employer account');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create employer account');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      email: '',
      phone: '',
      address: '',
      department_id: '',
      contact_person: ''
    });
    setValidationErrors({});
    setGeneratedCredentials(null);
    setShowCredentials(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-user-plus"></i>
          Create Employer
        </h1>
        <p className="admin-page-subtitle">Create new employer accounts with auto-generated credentials</p>
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

      {/* Generated Credentials Modal */}
      {showCredentials && generatedCredentials && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <i className="fas fa-key"></i>
                Generated Login Credentials
              </h3>
              <button 
                className="admin-btn-close"
                onClick={() => setShowCredentials(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-alert admin-alert-info">
                <i className="fas fa-info-circle"></i>
                Please save these credentials and share them with the employer. They can change these after first login.
              </div>
              
              <div className="admin-credential-display">
                <div className="admin-credential-item">
                  <label>Email:</label>
                  <div className="admin-credential-value">
                    <span>{generatedCredentials.email}</span>
                    <button 
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() => copyToClipboard(generatedCredentials.email)}
                      title="Copy to clipboard"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
                <div className="admin-credential-item">
                  <label>Password:</label>
                  <div className="admin-credential-value">
                    <span>{generatedCredentials.password}</span>
                    <button 
                      className="admin-btn admin-btn-sm admin-btn-secondary"
                      onClick={() => copyToClipboard(generatedCredentials.password)}
                      title="Copy to clipboard"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button 
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={() => setShowCredentials(false)}
              >
                <i className="fas fa-check"></i>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-grid-2">
        {/* Form Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="fas fa-building"></i>
              Employer Information
            </h2>
          </div>
          <div className="admin-card-body">
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="company_name">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={`admin-form-control ${validationErrors.company_name ? 'admin-form-control-error' : ''}`}
                    placeholder="Enter company name"
                    required
                  />
                  {validationErrors.company_name && (
                    <div className="admin-form-error">{validationErrors.company_name}</div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="contact_person">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleChange}
                    className={`admin-form-control ${validationErrors.contact_person ? 'admin-form-control-error' : ''}`}
                    placeholder="Enter contact person name"
                    required
                  />
                  {validationErrors.contact_person && (
                    <div className="admin-form-error">{validationErrors.contact_person}</div>
                  )}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="email">
                    Email (Auto-generated)
                  </label>
                  <div className="admin-input-group">
                    <i className="fas fa-envelope admin-input-icon"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`admin-form-control ${validationErrors.email ? 'admin-form-control-error' : ''}`}
                      placeholder="Auto-generated from company name"
                      readOnly
                    />
                  </div>
                  {validationErrors.email && (
                    <div className="admin-form-error">{validationErrors.email}</div>
                  )}
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="admin-input-group">
                    <i className="fas fa-phone admin-input-icon"></i>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`admin-form-control ${validationErrors.phone ? 'admin-form-control-error' : ''}`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {validationErrors.phone && (
                    <div className="admin-form-error">{validationErrors.phone}</div>
                  )}
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="department_id">
                  Department
                </label>
                <div className="admin-input-group">
                  <i className="fas fa-sitemap admin-input-icon"></i>
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="admin-form-control"
                  >
                    <option value="">Select Department (Optional)</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="address">
                  Company Address
                </label>
                <div className="admin-input-group">
                  <i className="fas fa-map-marker-alt admin-input-icon"></i>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="admin-form-control"
                    rows="3"
                    placeholder="Enter company address"
                  />
                </div>
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-btn admin-btn-secondary"
                  disabled={loading}
                >
                  <i className="fas fa-undo"></i>
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Create Employer Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card - Now beside the form */}
        <div className="info-card">
          <h3>How It Works</h3>
          <div className="info-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Enter Company Details</h4>
                <p>Fill in the comprehensive company information including:</p>
                <ul>
                  <li><strong>Company Name:</strong> This will be used to auto-generate login credentials</li>
                  <li><strong>Contact Person:</strong> Primary point of contact for the company</li>
                  <li><strong>Phone Number:</strong> Business contact number for communication</li>
                  <li><strong>Department:</strong> Optional assignment to organize employers by category</li>
                  <li><strong>Address:</strong> Complete business address for records and verification</li>
                </ul>
                <p><em>Note: Fields marked with * are required for account creation.</em></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Auto-Generate Credentials</h4>
                <p>The system automatically creates secure login credentials:</p>
                <ul>
                  <li><strong>Email Format:</strong> [companyname]@company.com</li>
                  <li><strong>Password Format:</strong> [companyname]123</li>
                  <li><strong>Processing:</strong> Company name is cleaned (spaces/special chars removed)</li>
                  <li><strong>Security:</strong> Credentials are hashed and stored securely in database</li>
                </ul>
                <p><em>Example: "ABC Corp" becomes email: "abccorp@company.com" and password: "abccorp123"</em></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Share Credentials</h4>
                <p>Securely provide login details to the employer:</p>
                <ul>
                  <li><strong>Copy Credentials:</strong> Use the copy buttons in the success modal</li>
                  <li><strong>Secure Delivery:</strong> Share via secure email or encrypted communication</li>
                  <li><strong>First Login:</strong> Employer uses these credentials to access their dashboard</li>
                  <li><strong>Access Portal:</strong> Direct them to the employer login section</li>
                </ul>
                <p><em>Important: Ensure credentials are shared through secure channels only.</em></p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h4>Employer Updates Profile</h4>
                <p>After first login, employers can customize their account:</p>
                <ul>
                  <li><strong>Change Password:</strong> Update to a personalized, secure password</li>
                  <li><strong>Update Email:</strong> Change to their preferred business email address</li>
                  <li><strong>Complete Profile:</strong> Add additional company information and branding</li>
                  <li><strong>Dashboard Access:</strong> Full access to post jobs, manage applications, and view analytics</li>
                </ul>
                <p><em>Recommendation: Encourage employers to update credentials immediately after first login.</em></p>
              </div>
            </div>
          </div>
          
          <div className="info-additional">
            <h4><i className="fas fa-lightbulb"></i> Additional Information</h4>
            <div className="info-section">
              <h5>Security Features:</h5>
              <ul>
                <li>All passwords are hashed using secure algorithms</li>
                <li>Session management prevents unauthorized access</li>
                <li>Role-based permissions ensure proper access control</li>
                <li>Account activity is logged for security monitoring</li>
              </ul>
            </div>
            
            <div className="info-section">
              <h5>What Employers Can Do:</h5>
              <ul>
                <li>Post and manage job listings</li>
                <li>Review and filter job applications</li>
                <li>Communicate with potential candidates</li>
                <li>Access recruitment analytics and reports</li>
                <li>Update company profile and preferences</li>
              </ul>
            </div>
            
            <div className="info-section">
              <h5>Best Practices:</h5>
              <ul>
                <li>Verify company information before account creation</li>
                <li>Use secure communication channels for credential sharing</li>
                <li>Follow up to ensure successful first login</li>
                <li>Provide onboarding support for new employers</li>
                <li>Monitor account activity for security purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployer;
