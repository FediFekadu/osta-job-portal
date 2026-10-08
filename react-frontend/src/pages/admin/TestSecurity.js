import React, { useState, useEffect } from 'react';
import apiService from '../../services/apiService';
import '../../styles/AdminComponents.css';

const TestSecurity = () => {
  const [activeTab, setActiveTab] = useState('tests');
  const [tests, setTests] = useState([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastScan, setLastScan] = useState(null);
  const [securityScore, setSecurityScore] = useState(0);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [selectedTests, setSelectedTests] = useState({
    sql_injection: true,
    xss_protection: true,
    csrf_protection: true,
    file_upload: true,
    authentication: true,
    authorization: true,
    session_security: true,
    password_policy: true,
    data_encryption: true,
    api_security: true,
    input_validation: true,
    error_handling: true
  });

  const tabs = [
    { id: 'tests', label: 'Security Tests', icon: 'fas fa-shield-alt' },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: 'fas fa-bug' },
    { id: 'monitoring', label: 'Security Monitoring', icon: 'fas fa-eye' },
    { id: 'reports', label: 'Security Reports', icon: 'fas fa-file-shield' }
  ];

  const securityTests = [
    { 
      id: 'sql_injection', 
      name: 'SQL Injection Protection', 
      description: 'Test for SQL injection vulnerabilities in database queries',
      severity: 'high',
      category: 'Database Security'
    },
    { 
      id: 'xss_protection', 
      name: 'XSS Protection', 
      description: 'Test for cross-site scripting vulnerabilities',
      severity: 'high',
      category: 'Web Security'
    },
    { 
      id: 'csrf_protection', 
      name: 'CSRF Protection', 
      description: 'Test for cross-site request forgery protection',
      severity: 'medium',
      category: 'Web Security'
    },
    { 
      id: 'file_upload', 
      name: 'File Upload Security', 
      description: 'Test file upload restrictions and validation',
      severity: 'high',
      category: 'File Security'
    },
    { 
      id: 'authentication', 
      name: 'Authentication Tests', 
      description: 'Test login and session security mechanisms',
      severity: 'critical',
      category: 'Access Control'
    },
    { 
      id: 'authorization', 
      name: 'Authorization Tests', 
      description: 'Test role-based access control and permissions',
      severity: 'critical',
      category: 'Access Control'
    },
    { 
      id: 'session_security', 
      name: 'Session Security', 
      description: 'Test session management and security',
      severity: 'high',
      category: 'Session Management'
    },
    { 
      id: 'password_policy', 
      name: 'Password Policy', 
      description: 'Test password strength and policy enforcement',
      severity: 'medium',
      category: 'Authentication'
    },
    { 
      id: 'data_encryption', 
      name: 'Data Encryption', 
      description: 'Test data encryption at rest and in transit',
      severity: 'high',
      category: 'Data Protection'
    },
    { 
      id: 'api_security', 
      name: 'API Security', 
      description: 'Test API endpoint security and rate limiting',
      severity: 'high',
      category: 'API Security'
    },
    { 
      id: 'input_validation', 
      name: 'Input Validation', 
      description: 'Test input sanitization and validation',
      severity: 'medium',
      category: 'Data Validation'
    },
    { 
      id: 'error_handling', 
      name: 'Error Handling', 
      description: 'Test secure error handling and information disclosure',
      severity: 'low',
      category: 'Information Security'
    }
  ];

  const severityColors = {
    critical: '#dc3545',
    high: '#fd7e14',
    medium: '#ffc107',
    low: '#28a745'
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      const [scanResponse, vulnerabilitiesResponse] = await Promise.all([
        apiService.getLastSecurityScan(),
        apiService.getVulnerabilities()
      ]);
      
      if (scanResponse.data) {
        setLastScan(scanResponse.data.last_scan);
        setSecurityScore(scanResponse.data.security_score || 0);
      }
      
      if (vulnerabilitiesResponse.data) {
        setVulnerabilities(vulnerabilitiesResponse.data.vulnerabilities || []);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelection = (testId) => {
    setSelectedTests(prev => ({
      ...prev,
      [testId]: !prev[testId]
    }));
  };

  const selectAllTests = () => {
    const allSelected = {};
    securityTests.forEach(test => {
      allSelected[test.id] = true;
    });
    setSelectedTests(allSelected);
  };

  const deselectAllTests = () => {
    const allDeselected = {};
    securityTests.forEach(test => {
      allDeselected[test.id] = false;
    });
    setSelectedTests(allDeselected);
  };

  const selectBySeverity = (severity) => {
    const severitySelected = { ...selectedTests };
    securityTests.forEach(test => {
      if (test.severity === severity) {
        severitySelected[test.id] = true;
      }
    });
    setSelectedTests(severitySelected);
  };

  const runSecurityTests = async () => {
    setRunning(true);
    setTests([]);
    setError('');
    
    try {
      const response = await apiService.runSecurityTests({
        tests: selectedTests
      });
      
      if (response.data.success) {
        setTests(response.data.results || []);
        setSecurityScore(response.data.security_score || 0);
        setLastScan(new Date().toISOString());
        setSuccess('Security tests completed successfully!');
        
        // Refresh vulnerabilities after test
        const vulnResponse = await apiService.getVulnerabilities();
        if (vulnResponse.data) {
          setVulnerabilities(vulnResponse.data.vulnerabilities || []);
        }
      } else {
        setError('Failed to run security tests: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error running security tests:', error);
      setError('Failed to run security tests. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const exportSecurityReport = async () => {
    try {
      const response = await apiService.exportSecurityReport({
        tests: tests,
        vulnerabilities: vulnerabilities,
        security_score: securityScore
      });
      
      // Trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Security report exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export security report');
    }
  };

  const resolveVulnerability = async (vulnId) => {
    try {
      await apiService.resolveVulnerability(vulnId);
      setVulnerabilities(prev => prev.filter(v => v.id !== vulnId));
      setSuccess('Vulnerability marked as resolved!');
    } catch (error) {
      setError('Failed to resolve vulnerability');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <i className="fas fa-check-circle text-success"></i>;
      case 'failed':
        return <i className="fas fa-times-circle text-danger"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-warning"></i>;
      default:
        return <i className="fas fa-question-circle text-muted"></i>;
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'badge-danger',
      high: 'badge-warning',
      medium: 'badge-info',
      low: 'badge-success'
    };
    return `badge ${colors[severity] || 'badge-secondary'}`;
  };

  const getSecurityScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'info';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading security data...</p>
      </div>
    );
  }

  const renderTestsTab = () => (
    <div className="tab-content">
      <div className="stats-cards">
        <div className="stat-card">
          <div className={`stat-icon ${getSecurityScoreColor(securityScore)}`}>
            <i className="fas fa-shield-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{securityScore}%</h3>
            <p>Security Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon error">
            <i className="fas fa-bug"></i>
          </div>
          <div className="stat-info">
            <h3>{vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length}</h3>
            <p>Critical/High Vulnerabilities</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{lastScan ? new Date(lastScan).toLocaleDateString() : 'Never'}</h3>
            <p>Last Security Scan</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{tests.filter(t => t.status === 'passed').length}</h3>
            <p>Tests Passed</p>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-list-check"></i> Select Security Tests</h3>
          <p>Choose which security tests to run on your system</p>
          <div className="header-actions">
            <button type="button" className="btn btn-sm btn-secondary" onClick={selectAllTests}>
              <i className="fas fa-check-square"></i> Select All
            </button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={deselectAllTests}>
              <i className="fas fa-square"></i> Deselect All
            </button>
            <div className="severity-filters">
              <button type="button" className="btn btn-sm btn-danger" onClick={() => selectBySeverity('critical')}>
                Critical
              </button>
              <button type="button" className="btn btn-sm btn-warning" onClick={() => selectBySeverity('high')}>
                High
              </button>
            </div>
          </div>
        </div>
        
        <div className="tests-grid">
          {securityTests.map(test => (
            <div key={test.id} className={`test-card ${selectedTests[test.id] ? 'selected' : ''}`}>
              <div className="test-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedTests[test.id]}
                    onChange={() => handleTestSelection(test.id)}
                  />
                  <span className="checkmark"></span>
                </label>
                <div className="test-meta">
                  <span className={getSeverityBadge(test.severity)}>{test.severity}</span>
                  <span className="category-badge">{test.category}</span>
                </div>
              </div>
              <div className="test-content">
                <h4>{test.name}</h4>
                <p>{test.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button 
            onClick={runSecurityTests} 
            className="btn btn-primary"
            disabled={running || Object.values(selectedTests).every(v => !v)}
          >
            {running ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Running Tests...
              </>
            ) : (
              <>
                <i className="fas fa-play"></i> Run Security Tests
              </>
            )}
          </button>
          {tests.length > 0 && (
            <button 
              onClick={exportSecurityReport}
              className="btn btn-secondary"
            >
              <i className="fas fa-download"></i> Export Report
            </button>
          )}
        </div>
      </div>

      {tests.length > 0 && (
        <div className="form-section">
          <div className="section-header">
            <h3><i className="fas fa-chart-bar"></i> Test Results</h3>
          </div>
          
          <div className="results-summary">
            <div className="summary-card passed">
              <div className="summary-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="summary-info">
                <h3>{tests.filter(t => t.status === 'passed').length}</h3>
                <p>Passed</p>
              </div>
            </div>
            <div className="summary-card failed">
              <div className="summary-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="summary-info">
                <h3>{tests.filter(t => t.status === 'failed').length}</h3>
                <p>Failed</p>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="summary-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div className="summary-info">
                <h3>{tests.filter(t => t.status === 'warning').length}</h3>
                <p>Warnings</p>
              </div>
            </div>
          </div>

          <div className="results-list">
            {tests.map((test, index) => (
              <div key={index} className={`result-card ${test.status}`}>
                <div className="result-header">
                  <div className="result-status">
                    {getStatusIcon(test.status)}
                    <h4>{test.name}</h4>
                  </div>
                  <span className={`status-badge ${test.status}`}>
                    {test.status.toUpperCase()}
                  </span>
                </div>
                <div className="result-content">
                  <p>{test.description}</p>
                  {test.details && (
                    <div className="test-details">
                      <h5>Details:</h5>
                      <pre>{test.details}</pre>
                    </div>
                  )}
                  {test.recommendations && (
                    <div className="recommendations">
                      <h5>Recommendations:</h5>
                      <ul>
                        {test.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderVulnerabilitiesTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-bug"></i> Security Vulnerabilities</h3>
          <p>Identified security vulnerabilities and their status</p>
        </div>

        {vulnerabilities.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-shield-check"></i>
            <h3>No Vulnerabilities Found</h3>
            <p>Your system appears to be secure. Run security tests to verify.</p>
          </div>
        ) : (
          <div className="vulnerabilities-list">
            {vulnerabilities.map((vuln) => (
              <div key={vuln.id} className={`vulnerability-card ${vuln.severity}`}>
                <div className="vuln-header">
                  <div className="vuln-info">
                    <h4>{vuln.title}</h4>
                    <span className={getSeverityBadge(vuln.severity)}>{vuln.severity}</span>
                  </div>
                  <div className="vuln-actions">
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => resolveVulnerability(vuln.id)}
                    >
                      <i className="fas fa-check"></i> Mark Resolved
                    </button>
                  </div>
                </div>
                <div className="vuln-content">
                  <p>{vuln.description}</p>
                  <div className="vuln-details">
                    <div className="detail-item">
                      <strong>Location:</strong> {vuln.location}
                    </div>
                    <div className="detail-item">
                      <strong>Risk Level:</strong> {vuln.risk_level}
                    </div>
                    <div className="detail-item">
                      <strong>Discovered:</strong> {new Date(vuln.discovered_at).toLocaleDateString()}
                    </div>
                  </div>
                  {vuln.solution && (
                    <div className="vuln-solution">
                      <h5>Solution:</h5>
                      <p>{vuln.solution}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-eye"></i> Security Monitoring</h3>
          <p>Real-time security monitoring and alerts</p>
        </div>

        <div className="monitoring-grid">
          <div className="monitor-card">
            <div className="monitor-header">
              <h4><i className="fas fa-user-shield"></i> Login Monitoring</h4>
            </div>
            <div className="monitor-stats">
              <div className="stat-item">
                <span className="stat-value">24</span>
                <span className="stat-label">Failed Logins (24h)</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">156</span>
                <span className="stat-label">Successful Logins (24h)</span>
              </div>
            </div>
          </div>

          <div className="monitor-card">
            <div className="monitor-header">
              <h4><i className="fas fa-globe"></i> Traffic Monitoring</h4>
            </div>
            <div className="monitor-stats">
              <div className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">Suspicious IPs</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">Blocked Requests</span>
              </div>
            </div>
          </div>

          <div className="monitor-card">
            <div className="monitor-header">
              <h4><i className="fas fa-file-upload"></i> File Upload Monitoring</h4>
            </div>
            <div className="monitor-stats">
              <div className="stat-item">
                <span className="stat-value">0</span>
                <span className="stat-label">Malicious Files Detected</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">45</span>
                <span className="stat-label">Files Scanned (24h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="tab-content">
      <div className="form-section">
        <div className="section-header">
          <h3><i className="fas fa-file-shield"></i> Security Reports</h3>
          <p>Generate and download comprehensive security reports</p>
        </div>

        <div className="reports-grid">
          <div className="report-card">
            <div className="report-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="report-content">
              <h4>Security Assessment Report</h4>
              <p>Comprehensive security assessment with recommendations</p>
              <button className="btn btn-primary" onClick={exportSecurityReport}>
                <i className="fas fa-download"></i> Generate Report
              </button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon">
              <i className="fas fa-bug"></i>
            </div>
            <div className="report-content">
              <h4>Vulnerability Report</h4>
              <p>Detailed vulnerability analysis and remediation steps</p>
              <button className="btn btn-primary">
                <i className="fas fa-download"></i> Generate Report
              </button>
            </div>
          </div>

          <div className="report-card">
            <div className="report-icon">
              <i className="fas fa-shield-check"></i>
            </div>
            <div className="report-content">
              <h4>Compliance Report</h4>
              <p>Security compliance status and audit trail</p>
              <button className="btn btn-primary">
                <i className="fas fa-download"></i> Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="header-text">
            <h2><i className="fas fa-shield-alt"></i> Security Testing</h2>
            <p>Comprehensive security testing and vulnerability management</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      <div className="admin-tabs">
        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="tab-content-wrapper">
          {activeTab === 'tests' && renderTestsTab()}
          {activeTab === 'vulnerabilities' && renderVulnerabilitiesTab()}
          {activeTab === 'monitoring' && renderMonitoringTab()}
          {activeTab === 'reports' && renderReportsTab()}
        </div>
      </div>
    </div>
  );
};

export default TestSecurity;
