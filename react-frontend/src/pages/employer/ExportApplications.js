import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const ExportApplications = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    include_resume: false,
    include_cover_letter: true
  });
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await apiService.get('/api/employer/jobs.php');
      if (response.data.success) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setMessage('');

    try {
      const exportData = {
        job_id: selectedJob,
        format: format,
        date_range: dateRange,
        filters: filters
      };

      const response = await apiService.post('/api/employer/export-applications.php', exportData);

      if (response.data.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.data.download_url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setMessage('Applications exported successfully!');
      }
    } catch (error) {
      setMessage('Error exporting applications. Please try again.');
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="employer-export-applications">
      <div className="page-header">
        <h1><i className="fas fa-download"></i> Export Applications</h1>
        <p>Download application data in various formats</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="export-form">
        <div className="form-section">
          <h3>Select Job</h3>
          <div className="form-group">
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              required
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.applications_count} applications)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Date Range</h3>
          <div className="form-row">
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Filters</h3>
          <div className="form-group">
            <label>Application Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.include_cover_letter}
                onChange={(e) => setFilters({...filters, include_cover_letter: e.target.checked})}
              />
              Include Cover Letters
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={filters.include_resume}
                onChange={(e) => setFilters({...filters, include_resume: e.target.checked})}
              />
              Include Resume Links
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Export Format</h3>
          <div className="format-options">
            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <div className="format-content">
                <i className="fas fa-file-csv"></i>
                <span>CSV (Spreadsheet)</span>
              </div>
            </label>

            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <div className="format-content">
                <i className="fas fa-file-pdf"></i>
                <span>PDF Report</span>
              </div>
            </label>

            <label className="format-option">
              <input
                type="radio"
                name="format"
                value="excel"
                checked={format === 'excel'}
                onChange={(e) => setFormat(e.target.value)}
              />
              <div className="format-content">
                <i className="fas fa-file-excel"></i>
                <span>Excel File</span>
              </div>
            </label>
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
                <i className="fas fa-download"></i> Export Applications
              </>
            )}
          </button>
        </div>
      </div>

      <div className="export-info">
        <h3><i className="fas fa-info-circle"></i> Export Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>CSV Format</h4>
            <p>Best for data analysis and spreadsheet applications. Includes all application data in tabular format.</p>
          </div>
          <div className="info-item">
            <h4>PDF Report</h4>
            <p>Professional formatted report with applicant details, perfect for printing and sharing.</p>
          </div>
          <div className="info-item">
            <h4>Excel File</h4>
            <p>Advanced spreadsheet with formatting, charts, and multiple sheets for comprehensive analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportApplications;
