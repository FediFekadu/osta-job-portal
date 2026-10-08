import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';

const CancelApplication = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      const response = await apiService.get(`/api/applicant/applications.php?id=${applicationId}`);
      if (response.data.success) {
        setApplication(response.data.application);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelApplication = async () => {
    setCancelling(true);
    try {
      const response = await apiService.delete(`/api/applicant/applications.php?id=${applicationId}`, {
        data: { reason }
      });
      if (response.data.success) {
        navigate('/applicant/applications', { 
          state: { message: 'Application cancelled successfully' }
        });
      }
    } catch (error) {
      console.error('Error cancelling application:', error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading application...</div>;
  }

  if (!application) {
    return (
      <div className="error-message">
        <h2>Application not found</h2>
        <button onClick={() => navigate('/applicant/applications')} className="btn-back">
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="cancel-application">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h1>Cancel Application</h1>
      </div>

      <div className="cancel-content">
        <div className="application-details">
          <h3>Application Details</h3>
          <div className="detail-card">
            <h4>{application.job_title}</h4>
            <p><strong>Company:</strong> {application.company_name}</p>
            <p><strong>Applied Date:</strong> {new Date(application.applied_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> 
              <span className={`status-badge ${application.status}`}>
                {application.status}
              </span>
            </p>
          </div>
        </div>

        <div className="cancel-form">
          <div className="warning-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Are you sure you want to cancel this application?</h3>
            <p>This action cannot be undone. You will need to reapply if you change your mind.</p>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason for cancellation (optional)</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
              placeholder="Please provide a reason for cancelling your application..."
            />
          </div>

          <div className="form-actions">
            <button 
              onClick={cancelApplication}
              className="btn-cancel-confirm"
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Yes, Cancel Application'}
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="btn-keep"
            >
              Keep Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelApplication;
