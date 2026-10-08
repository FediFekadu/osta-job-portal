import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const Export = () => {
  const { user } = useAuth();
  const [exportType, setExportType] = useState('profile');
  const [format, setFormat] = useState('pdf');
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  const exportOptions = [
    { value: 'profile', label: 'Profile Information', description: 'Export your complete profile data' },
    { value: 'applications', label: 'Job Applications', description: 'Export all your job applications history' },
    { value: 'saved_jobs', label: 'Saved Jobs', description: 'Export your saved jobs list' },
    { value: 'job_alerts', label: 'Job Alerts', description: 'Export your job alert settings' },
    { value: 'all', label: 'Complete Data', description: 'Export all your data in one file' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: 'fas fa-file-pdf' },
    { value: 'csv', label: 'CSV', icon: 'fas fa-file-csv' },
    { value: 'json', label: 'JSON', icon: 'fas fa-file-code' }
  ];

  const handleExport = async () => {
    setExporting(true);
    setMessage('');

    try {
      const response = await apiService.post('/api/applicant/export.php', {
        type: exportType,
        format: format
      });

      if (response.data.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage('Export completed successfully!');
      }
    } catch (error) {
      setMessage('Error exporting data. Please try again.');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="applicant-export">
      <div className="page-header">
        <h1><i className="fas fa-download"></i> Export Data</h1>
        <p>Download your data in various formats</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="export-form">
        <div className="form-section">
          <h3>What would you like to export?</h3>
          <div className="export-options">
            {exportOptions.map(option => (
              <label key={option.value} className="export-option">
                <input
                  type="radio"
                  name="exportType"
                  value={option.value}
                  checked={exportType === option.value}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <div className="option-content">
                  <h4>{option.label}</h4>
                  <p>{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Choose format</h3>
          <div className="format-options">
            {formatOptions.map(formatOption => (
              <label key={formatOption.value} className="format-option">
                <input
                  type="radio"
                  name="format"
                  value={formatOption.value}
                  checked={format === formatOption.value}
                  onChange={(e) => setFormat(e.target.value)}
                />
                <div className="format-content">
                  <i className={formatOption.icon}></i>
                  <span>{formatOption.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="export-info">
          <div className="info-card">
            <h4><i className="fas fa-info-circle"></i> Export Information</h4>
            <ul>
              <li><strong>PDF:</strong> Best for viewing and printing</li>
              <li><strong>CSV:</strong> Best for spreadsheet applications</li>
              <li><strong>JSON:</strong> Best for technical use and data portability</li>
            </ul>
          </div>
        </div>

        <div className="form-actions">
          <button 
            onClick={handleExport}
            className="btn-export"
            disabled={exporting}
          >
            {exporting ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Exporting...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i> Export Data
              </>
            )}
          </button>
        </div>
      </div>

      <div className="data-privacy">
        <h3><i className="fas fa-shield-alt"></i> Data Privacy</h3>
        <p>
          Your exported data contains personal information. Please ensure you store and 
          handle the downloaded files securely. We recommend deleting exported files 
          after use if they're no longer needed.
        </p>
      </div>
    </div>
  );
};

export default Export;
