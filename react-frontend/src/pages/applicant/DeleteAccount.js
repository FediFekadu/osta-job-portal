import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const DeleteAccount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (confirmText !== 'DELETE') {
      setError('Please type "DELETE" to confirm account deletion.');
      return;
    }

    if (!password) {
      setError('Please enter your password to confirm.');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await apiService.delete('/api/applicant/delete-account.php', {
        data: {
          password,
          reason,
          confirm: confirmText
        }
      });

      if (response.data.success) {
        logout();
        navigate('/', { 
          state: { message: 'Your account has been deleted successfully.' }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting account. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="delete-account">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Delete Account</h1>
      </div>

      <div className="delete-content">
        <div className="warning-section">
          <div className="warning-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>This action cannot be undone</h2>
          <p>Deleting your account will permanently remove:</p>
          <ul>
            <li>Your profile and personal information</li>
            <li>All job applications and their history</li>
            <li>Saved jobs and job alerts</li>
            <li>All messages and communications</li>
          </ul>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleDeleteAccount} className="delete-form">
          <div className="form-group">
            <label htmlFor="reason">Reason for leaving (optional)</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Help us improve by telling us why you're leaving..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Enter your password to confirm</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Type "DELETE" to confirm</label>
            <input
              type="text"
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-delete-confirm"
              disabled={deleting || confirmText !== 'DELETE'}
            >
              {deleting ? 'Deleting Account...' : 'Delete My Account'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/applicant/profile')}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="alternative-actions">
          <h3>Looking for something else?</h3>
          <div className="action-links">
            <button 
              onClick={() => navigate('/applicant/profile')}
              className="btn-alternative"
            >
              <i className="fas fa-user-edit"></i>
              Edit Profile Instead
            </button>
            <button 
              onClick={() => navigate('/applicant/settings')}
              className="btn-alternative"
            >
              <i className="fas fa-cog"></i>
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;
