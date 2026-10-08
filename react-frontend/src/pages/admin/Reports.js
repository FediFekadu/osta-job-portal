import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const Reports = () => {
  const [reportType, setReportType] = useState('users');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState(['total', 'active', 'growth']);

  const reportTypes = [
    { value: 'users', label: 'User Registration Report', icon: 'fas fa-users', description: 'Analyze user registration trends and demographics' },
    { value: 'jobs', label: 'Job Postings Report', icon: 'fas fa-briefcase', description: 'Track job posting activity and performance' },
    { value: 'applications', label: 'Applications Report', icon: 'fas fa-file-alt', description: 'Monitor application submissions and success rates' },
    { value: 'departments', label: 'Departments Report', icon: 'fas fa-building', description: 'Analyze department performance and activity' },
    { value: 'activity', label: 'System Activity Report', icon: 'fas fa-chart-line', description: 'Overall system usage and engagement metrics' }
  ];

  const availableMetrics = {
    users: ['total', 'active', 'growth', 'by_role', 'registration_trend'],
    jobs: ['total_posted', 'active_jobs', 'filled_positions', 'by_department', 'posting_trend'],
    applications: ['total_applications', 'pending', 'approved', 'rejected', 'success_rate'],
    departments: ['total_departments', 'active_jobs_per_dept', 'applications_per_dept', 'performance'],
    activity: ['daily_logins', 'page_views', 'user_engagement', 'peak_hours']
  };

  useEffect(() => {
    // Set default date range to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      generateReport();
    }
  }, [reportType]);

  const generateReport = async () => {
    if (!dateRange.start || !dateRange.end) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await apiService.generateReport(reportType, {
        ...dateRange,
        metrics: selectedMetrics
      });
      setReportData(response.data);
      setSuccess('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      setSuccess(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
      const response = await apiService.exportReport(reportType, format, {
        ...dateRange,
        metrics: selectedMetrics
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      setError(`Failed to export report as ${format.toUpperCase()}`);
    }
  };

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const renderMetricCards = () => {
    if (!reportData?.summary) return null;

    return (
      <div className="admin-stats-grid">
        {Object.entries(reportData.summary).map(([key, value]) => {
          const metric = reportTypes.find(t => t.value === reportType);
          return (
            <div key={key} className="admin-stat-card">
              <div className="admin-stat-header">
                <h3 className="admin-stat-title">{key.replace('_', ' ').toUpperCase()}</h3>
                <div className="admin-stat-icon">
                  <i className={metric?.icon || 'fas fa-chart-bar'}></i>
                </div>
              </div>
              <div className="admin-stat-value" style={{fontSize: '2rem', fontWeight: 'bold', color: 'var(--admin-primary)'}}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {reportData.trends && reportData.trends[key] && (
                <div className="admin-stat-trend">
                  <i className={`fas ${reportData.trends[key] > 0 ? 'fa-arrow-up text-success' : 'fa-arrow-down text-danger'}`}></i>
                  <span className={reportData.trends[key] > 0 ? 'text-success' : 'text-danger'}>
                    {Math.abs(reportData.trends[key])}% from last period
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="admin-text-center admin-mt-5">
          <div className="spinner-border" role="status">
            <span className="sr-only">Generating report...</span>
          </div>
          <p className="admin-mt-3">Generating report...</p>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="admin-text-center admin-mt-5">
          <div className="admin-mb-3">
            <i className="fas fa-chart-line" style={{fontSize: '3rem', color: 'var(--admin-border-medium)'}}></i>
          </div>
          <h3 className="admin-mb-2">No Data Available</h3>
          <p className="admin-mb-3">Select report parameters and click "Generate Report" to view data.</p>
        </div>
      );
    }

    return (
      <div className="admin-mt-4">
        {/* Summary Cards */}
        <div className="admin-card admin-mb-4">
          <div className="admin-card-header">
            <h2 className="admin-card-title">
              <i className="fas fa-chart-pie"></i>
              Summary Metrics
            </h2>
          </div>
          <div className="admin-card-body">
            {renderMetricCards()}
          </div>
        </div>

        {/* Chart Visualization */}
        {reportData.chartData && (
          <div className="admin-card admin-mb-4">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <i className="fas fa-chart-area"></i>
                Trends Over Time
              </h2>
            </div>
            <div className="admin-card-body">
              <div className="admin-text-center admin-p-5" style={{backgroundColor: 'var(--admin-bg-light)', borderRadius: 'var(--admin-border-radius)'}}>
                <i className="fas fa-chart-area" style={{fontSize: '3rem', color: 'var(--admin-primary)', marginBottom: '1rem'}}></i>
                <h4>Interactive Chart</h4>
                <p>Chart visualization component would be integrated here (Chart.js, D3.js, etc.)</p>
                <div className="admin-mt-3">
                  <span className="badge badge-info">Data Points: {reportData.chartData.length}</span>
                  <span className="badge badge-success admin-ml-2">Period: {dateRange.start} to {dateRange.end}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Table */}
        {reportData.tableData && reportData.tableData.length > 0 && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">
                <i className="fas fa-table"></i>
                Detailed Data
              </h2>
              <span className="badge badge-info">{reportData.tableData.length} records</span>
            </div>
            <div className="admin-card-body">
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {Object.keys(reportData.tableData[0] || {}).map(header => (
                        <th key={header}>{header.replace('_', ' ').toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.tableData.slice(0, 50).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{typeof value === 'number' ? value.toLocaleString() : value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.tableData.length > 50 && (
                <div className="admin-text-center admin-mt-3">
                  <p className="admin-text-muted">Showing first 50 records of {reportData.tableData.length} total. Export for complete data.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const selectedReportType = reportTypes.find(type => type.value === reportType);

  return (
    <div className="admin-content">
      {/* Page Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <i className="fas fa-chart-bar"></i>
          Reports & Analytics
        </h1>
        <p className="admin-page-subtitle">Generate comprehensive reports and analyze system data</p>
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

      {/* Report Configuration */}
      <div className="admin-card admin-mb-4">
        <div className="admin-card-header">
          <h2 className="admin-card-title">
            <i className="fas fa-cog"></i>
            Report Configuration
          </h2>
          <div className="admin-d-flex admin-gap-2">
            <button 
              className="admin-btn admin-btn-outline"
              onClick={() => exportReport('pdf')}
              disabled={!reportData || loading}
            >
              <i className="fas fa-file-pdf"></i>
              Export PDF
            </button>
            <button 
              className="admin-btn admin-btn-outline"
              onClick={() => exportReport('excel')}
              disabled={!reportData || loading}
            >
              <i className="fas fa-file-excel"></i>
              Export Excel
            </button>
          </div>
        </div>
        <div className="admin-card-body">
          {/* Report Type Selection */}
          <div className="admin-row admin-mb-4">
            <div className="admin-col-md-12">
              <label className="admin-form-label">Select Report Type</label>
              <div className="admin-row">
                {reportTypes.map(type => (
                  <div key={type.value} className="admin-col-md-4 admin-mb-3">
                    <div 
                      className={`admin-card ${reportType === type.value ? 'admin-border-primary' : ''}`}
                      style={{cursor: 'pointer', transition: 'all 0.2s'}}
                      onClick={() => setReportType(type.value)}
                    >
                      <div className="admin-card-body admin-text-center">
                        <i className={`${type.icon} admin-mb-2`} style={{fontSize: '2rem', color: reportType === type.value ? 'var(--admin-primary)' : 'var(--admin-border-medium)'}}></i>
                        <h5 className={reportType === type.value ? 'admin-text-primary' : ''}>{type.label}</h5>
                        <p className="admin-text-muted admin-font-size-sm">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range and Metrics */}
          <div className="admin-row">
            <div className="admin-col-md-3">
              <div className="admin-form-group">
                <label className="admin-form-label">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-col-md-3">
              <div className="admin-form-group">
                <label className="admin-form-label">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="admin-form-control"
                />
              </div>
            </div>
            <div className="admin-col-md-4">
              <div className="admin-form-group">
                <label className="admin-form-label">Metrics to Include</label>
                <div className="admin-d-flex admin-flex-wrap admin-gap-2">
                  {availableMetrics[reportType]?.map(metric => (
                    <label key={metric} className="admin-checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={() => handleMetricToggle(metric)}
                        className="admin-checkbox"
                      />
                      <span className="admin-ml-1">{metric.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-col-md-2">
              <div className="admin-form-group">
                <label className="admin-form-label">&nbsp;</label>
                <button 
                  className="admin-btn admin-btn-primary admin-w-100"
                  onClick={generateReport}
                  disabled={loading || !dateRange.start || !dateRange.end}
                >
                  <i className="fas fa-sync-alt"></i>
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReportContent()}
    </div>
  );
};

export default Reports;
