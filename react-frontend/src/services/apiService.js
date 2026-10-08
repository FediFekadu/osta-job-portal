import axios from 'axios';

// Configure base URL to work with proxy and ensure credentials are sent
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/osta_job_portal' : '/',
  withCredentials: true, // CRITICAL: This ensures cookies/sessions are sent
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // Add timeout to prevent hanging requests
});

// Add request interceptor to handle CSRF tokens and debugging
api.interceptors.request.use((config) => {
  // Add CSRF token if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken;
  }
  
  // Ensure credentials are always sent
  config.withCredentials = true;
  
  // Debug logging
  console.log('API Request:', {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    withCredentials: config.withCredentials,
    headers: config.headers
  });
  
  return config;
});

// Add response interceptor to handle errors and debugging
api.interceptors.response.use(
  (response) => {
    // Debug logging for successful responses
    console.log('API Response Success:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    // Debug logging for errors
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      fullError: error.response?.data,
      headers: error.response?.headers
    });
    
    // Only redirect to login for specific authentication failures
    if (error.response?.status === 401) {
      // Check if this is a legitimate authentication failure
      const url = error.config?.url || '';
      const isAuthEndpoint = url.includes('/auth/');
      const isLoginPage = window.location.pathname === '/login';
      
      // Only redirect if:
      // 1. It's an auth endpoint (login/register/user check)
      // 2. We're not already on the login page
      // 3. The error message indicates session expired
      if (isAuthEndpoint || (!isLoginPage && error.response?.data?.message?.includes('session'))) {
        console.warn('Authentication failed, redirecting to login:', error.response?.data?.message);
        window.location.href = '/login';
      } else {
        // For other 401 errors (like admin API calls), just log and let the component handle it
        console.warn('API call unauthorized:', url, error.response?.data?.message);
      }
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Core API methods
  get: (url, config = {}) => api.get(url, { ...config, withCredentials: true }),
  post: (url, data, config = {}) => api.post(url, data, { ...config, withCredentials: true }),
  put: (url, data, config = {}) => api.put(url, data, { ...config, withCredentials: true }),
  delete: (url, config = {}) => api.delete(url, { ...config, withCredentials: true }),

  // Public endpoints
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/api/jobs.php?${params}`);
    return response.data;
  },

  getJob: async (id) => {
    const response = await api.get(`/api/jobs.php/${id}`);
    return response.data;
  },

  getDepartments: async () => {
    const response = await api.get('/api/departments.php');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/stats.php');
    return response.data;
  },

  // User Profile
  getUserProfile: () => api.get('/api/user/profile.php'),
  updateUserProfile: (data) => api.put('/api/user/profile.php', data),

  // Applications
  getApplications: () => api.get('/api/applications/list.php'),
  submitJobApplication: (formData) => {
    return api.post('/applicant/apply_job.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
  },
  getPendingJobApplication: () => api.get('/api/applications/pending.php'),
  cancelPendingApplication: () => api.post('/applicant/cancel_application.php'),

  // Jobs
  getJobs: (params = {}) => api.get('/api/jobs/list.php', { params }),
  getJobDetails: (jobId) => api.get(`/api/jobs/details.php?id=${jobId}`),
  saveJob: (jobId) => api.post('/applicant/save_job.php', { job_id: jobId }),
  getSavedJobs: () => api.get('/api/jobs/saved.php'),

  // Job Alerts
  getJobAlerts: () => api.get('/api/alerts/list.php'),
  createJobAlert: (data) => api.post('/api/alerts/create.php', data),
  updateJobAlert: (id, data) => api.put(`/api/alerts/update.php?id=${id}`, data),
  deleteJobAlert: (id) => api.delete(`/api/alerts/delete.php?id=${id}`),

  // Dashboard Stats
  getDashboardStats: () => api.get('/api/dashboard/stats.php'),

  // Admin-specific endpoints
  getAdminStats: () => api.get('/api/admin/stats.php'),
  getRecentActivity: () => api.get('/api/admin/activity.php'),
  getPendingApprovals: () => api.get('/api/admin/pending.php'),
  handleApproval: (type, id, action) => api.post('/api/admin/approval.php', { type, id, action }),

  // User management
  getUsers: (params = {}) => api.get('/api/admin/users.php', { params }),
  createUser: (userData) => api.post('/api/admin/users.php', userData),
  updateUser: (id, userData) => api.put(`/api/admin/users.php?id=${id}`, userData),
  deleteUser: (id) => api.delete(`/api/admin/users.php?id=${id}`),

  // Department management
  getDepartments: () => api.get('/api/admin/departments.php'),
  createDepartment: (deptData) => api.post('/api/admin/departments.php', deptData),
  updateDepartment: (id, deptData) => api.put(`/api/admin/departments.php?id=${id}`, deptData),
  deleteDepartment: (id) => api.delete(`/api/admin/departments.php?id=${id}`),

  // Authentication
  getCurrentUser: () => api.get('/api/auth/user.php'),
  login: (credentials) => api.post('/api/auth/login.php', credentials),
  logout: () => api.post('/api/auth/logout.php'),

  // Employer-specific endpoints
  getEmployerStats: () => api.get('/api/employer/stats.php'),
  getEmployerJobs: (params = {}) => api.get('/api/employer/jobs.php', { params }),
  getEmployerApplications: (params = {}) => api.get('/api/employer/applications.php', { params }),
  createJob: (jobData) => api.post('/api/employer/jobs.php', jobData),
  updateJob: (id, jobData) => api.put(`/api/employer/jobs.php?id=${id}`, jobData),
  deleteJob: (id) => api.delete(`/api/employer/jobs.php?id=${id}`),
  getJobApplications: (jobId) => api.get(`/api/employer/jobs/${jobId}/applications.php`),
  updateApplicationStatus: (applicationId, status) => api.put(`/api/employer/applications.php?id=${applicationId}`, { status }),
  getEmployerProfile: () => api.get('/api/employer/profile.php'),
  updateEmployerProfile: (profileData) => api.put('/api/employer/profile.php', profileData),

  // Admin Profile Management
  getAdminProfile: () => api.get('/api/admin/profile.php'),
  updateAdminProfile: (profileData) => api.put('/api/admin/profile.php', profileData),
  changeAdminPassword: (passwordData) => api.post('/api/admin/change-password.php', passwordData),

  // Admin User Management
  createEmployer: (employerData) => api.post('/api/admin/create-employer.php', employerData),
  getProfiles: (params = {}) => api.get('/api/admin/profiles.php', { params }),
  getProfileStats: () => api.get('/api/admin/profile-stats.php'),
  updateProfileStatus: (profileId, status) => api.put(`/api/admin/profiles.php?id=${profileId}`, { status }),
  verifyProfile: (profileId) => api.post(`/api/admin/verify-profile.php`, { profile_id: profileId }),
  bulkProfileAction: (action, profileIds) => api.post('/api/admin/bulk-profiles.php', { action, profile_ids: profileIds }),
  exportProfiles: (format = 'csv') => api.get(`/api/admin/export-profiles.php?format=${format}`, { responseType: 'blob' }),

  // Applicant methods
  getApplicantStats() {
    return api.get('/api/applicant/stats.php');
  },
  getApplicantProfile() {
    return api.get('/api/applicant/profile.php');
  },
  updateApplicantProfile(data) {
    return api.post('/api/applicant/profile.php', data);
  },
  getApplicantApplications(params = {}) {
    return api.get('/api/applicant/applications.php', { params });
  },
  getApplicantSavedJobs() {
    return api.get('/api/applicant/saved-jobs.php');
  },
  saveJobForApplicant(jobId) {
    return api.post('/api/applicant/save-job.php', { job_id: jobId });
  },
  unsaveJobForApplicant(jobId) {
    return api.delete(`/api/applicant/save-job.php?job_id=${jobId}`);
  },
  getApplicantJobAlerts() {
    return api.get('/api/applicant/job-alerts.php');
  },
  createApplicantJobAlert(data) {
    return api.post('/api/applicant/job-alerts.php', data);
  },
  updateApplicantJobAlert(id, data) {
    return api.put(`/api/applicant/job-alerts.php?id=${id}`, data);
  },
  deleteApplicantJobAlert(id) {
    return api.delete(`/api/applicant/job-alerts.php?id=${id}`);
  },

  // Enhanced workflow methods
  getRecentApplications(limit = 5) {
    return api.get(`/api/applicant/applications.php?recent=true&limit=${limit}`);
  },
  getRecommendedJobs(limit = 10) {
    return api.get(`/api/jobs.php?recommended=true&limit=${limit}`);
  },
  getUpcomingInterviews() {
    return api.get('/api/applicant/interviews.php');
  },
  getRecentActivity(limit = 10) {
    return api.get(`/api/applicant/activity.php?limit=${limit}`);
  },

  // Enhanced employer methods
  getEmployerDashboardData() {
    return api.get('/api/employer/dashboard.php');
  },
  getEmployerRecentApplications(limit = 10) {
    return api.get(`/api/employer/applications.php?recent=true&limit=${limit}`);
  },
  getEmployerJobStats(jobId) {
    return api.get(`/api/employer/jobs.php?id=${jobId}&stats=true`);
  },

  // Enhanced admin methods
  getAdminDashboardData() {
    return api.get('/api/admin/dashboard.php');
  },
  getAdminStats() {
    return api.get('/api/admin/stats.php');
  },
  getPendingApprovals() {
    return api.get('/api/admin/pending.php');
  },
  getSystemHealth() {
    return api.get('/api/admin/system-health.php');
  },
  getAdminRecentActivity(limit = 20) {
    return api.get(`/api/admin/activity.php?limit=${limit}`);
  },

  // File upload methods
  uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return api.post('/api/upload.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Workflow-specific methods
  submitApplication(jobId, applicationData) {
    const formData = new FormData();
    formData.append('job_id', jobId);
    Object.keys(applicationData).forEach(key => {
      if (applicationData[key] !== null && applicationData[key] !== undefined) {
        formData.append(key, applicationData[key]);
      }
    });
    return api.post('/api/applicant/apply.php', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  cancelApplication(applicationId) {
    return api.post('/api/applicant/cancel-application.php', { application_id: applicationId });
  },

  // Admin workflow methods
  approveApplication(applicationId) {
    return api.post('/api/admin/approve-application.php', { application_id: applicationId });
  },

  rejectApplication(applicationId, reason = '') {
    return api.post('/api/admin/reject-application.php', { 
      application_id: applicationId, 
      reason: reason 
    });
  },

  // Employer workflow methods
  scheduleInterview(applicationId, interviewData) {
    return api.post('/api/employer/schedule-interview.php', {
      application_id: applicationId,
      ...interviewData
    });
  },

  updateApplicationStatusByEmployer(applicationId, status, notes = '') {
    return api.post('/api/employer/update-application.php', {
      application_id: applicationId,
      status: status,
      notes: notes
    });
  },

  // Test connection method
  testConnection: async () => {
    try {
      const response = await api.get('/test_api_connection.php');
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  },

  // Session debugging method
  checkSession: async () => {
    try {
      const response = await api.get('/check_session.php');
      return response.data;
    } catch (error) {
      console.error('Session check failed:', error);
      throw error;
    }
  },
};

// Export both named and default for compatibility
export { apiService };
export default apiService;
