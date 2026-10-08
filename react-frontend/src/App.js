import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import LoadingScreen from './components/LoadingScreen';

// Applicant Pages
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicantProfile from './pages/applicant/Profile';
import SavedJobs from './pages/applicant/SavedJobs';
import Applications from './pages/applicant/Applications';
import JobAlerts from './pages/applicant/JobAlerts';
import BrowseJobs from './pages/applicant/BrowseJobs';
import Alerts from './pages/applicant/Alerts';
import ApplyJob from './pages/applicant/ApplyJob';
import Apply from './pages/applicant/Apply';
import CancelApplication from './pages/applicant/CancelApplication';
import DeleteAccount from './pages/applicant/DeleteAccount';
import Export from './pages/applicant/Export';
import SaveJob from './pages/applicant/SaveJob';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDepartments from './pages/admin/ManageDepartments';
import Analytics from './pages/admin/Analytics';
import ManageJobs from './pages/admin/ManageJobs';
import Notifications from './pages/admin/Notifications';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import SetupEmail from './pages/admin/SetupEmail';
import TestSecurity from './pages/admin/TestSecurity';
import Profiles from './pages/admin/Profiles';
import AdminProfile from './pages/admin/AdminProfile';
import CreateEmployer from './pages/admin/CreateEmployer';
import AdminLayout from './components/AdminLayout';
import RecentActivityTable from './components/RecentActivityTable';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard';
import PostJob from './pages/employer/PostJob';
import ManageApplications from './pages/employer/ManageApplications';
import EmployerProfile from './pages/employer/EmployerProfile';
import EditJob from './pages/employer/EditJob';
import ExportApplications from './pages/employer/ExportApplications';
import ProfileSettings from './pages/employer/ProfileSettings';
import EmployerLayout from './components/EmployerLayout';

// Shared Components
import Logout from './pages/shared/Logout';
import ApplicantLayout from './components/ApplicantLayout';
import ApiTest from './components/ApiTest';
import SessionTest from './components/SessionTest';

import './styles/App.css';
import './styles/components.css';
import './styles/GlobalProfessional.css';
import HomePage from './pages/HomePage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* API Test Route - for debugging */}
      <Route path="/api-test" element={<ApiTest />} />
      
      {/* Session Test Route - for debugging authentication */}
      <Route path="/session-test" element={<SessionTest />} />
      
      {/* Public Routes - accessible to all */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes - require authentication */}
      {!user ? (
        <Route path="*" element={<Navigate to="/login" replace />} />
      ) : (
        <>
          {/* Shared Routes */}
          <Route path="/logout" element={<Logout />} />
          
          {/* Role-based default redirects */}
          <Route path="/dashboard" element={
            <Navigate to={
              user.role === 'admin' ? '/admin/dashboard' :
              user.role === 'employer' ? '/employer/dashboard' :
              user.role === 'applicant' ? '/applicant/dashboard' :
              '/login'
            } replace />
          } />
      
          {/* Applicant Routes */}
          {user.role === 'applicant' && (
            <>
              <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
              <Route path="/applicant/profile" element={<ApplicantProfile />} />
              <Route path="/applicant/saved-jobs" element={<SavedJobs />} />
              <Route path="/applicant/applications" element={<Applications />} />
              <Route path="/applicant/job-alerts" element={<JobAlerts />} />
              <Route path="/applicant/browse-jobs" element={<BrowseJobs />} />
              <Route path="/applicant/alerts" element={<Alerts />} />
              <Route path="/applicant/apply" element={<Apply />} />
              <Route path="/applicant/export" element={<Export />} />
              <Route path="/applicant/delete-account" element={<DeleteAccount />} />
              <Route path="/jobs/:jobId/apply" element={<ApplyJob />} />
              <Route path="/jobs/:jobId/save" element={<SaveJob />} />
              <Route path="/applications/:applicationId/cancel" element={<CancelApplication />} />
            </>
          )}
          
          {/* Admin Routes */}
          {user.role === 'admin' && (
            <Route path="/admin/*" element={
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="departments" element={<ManageDepartments />} />
                  <Route path="create-employer" element={<CreateEmployer />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="jobs" element={<ManageJobs />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="profile" element={<AdminProfile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="setup-email" element={<SetupEmail />} />
                  <Route path="test-security" element={<TestSecurity />} />
                  <Route path="profiles" element={<Profiles />} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </AdminLayout>
            } />
          )}
          
          {/* Employer Routes */}
          {user.role === 'employer' && (
            <Route path="/employer/*" element={
              <EmployerLayout>
                <Routes>
                  <Route path="dashboard" element={<EmployerDashboard />} />
                  <Route path="post-job" element={<PostJob />} />
                  <Route path="applications" element={<ManageApplications />} />
                  <Route path="profile" element={<EmployerProfile />} />
                  <Route path="profile-settings" element={<ProfileSettings />} />
                  <Route path="edit-job/:id" element={<EditJob />} />
                  <Route path="export-applications" element={<ExportApplications />} />
                  <Route path="" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </EmployerLayout>
            } />
          )}
          
          {/* Fallback for authenticated users */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
