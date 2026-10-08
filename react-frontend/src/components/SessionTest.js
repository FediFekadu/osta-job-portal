import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const SessionTest = () => {
    const [sessionData, setSessionData] = useState(null);
    const [adminStats, setAdminStats] = useState(null);
    const [publicStats, setPublicStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const runSessionTest = async () => {
        setLoading(true);
        
        try {
            // Test 1: Check current session
            console.log('Testing session...');
            const session = await apiService.checkSession();
            setSessionData(session);
            
            // Test 2: Try public stats (should always work)
            console.log('Testing public stats...');
            const publicResponse = await apiService.get('/api/stats.php');
            setPublicStats(publicResponse.data);
            
            // Test 3: Try admin stats (requires authentication)
            console.log('Testing admin stats...');
            try {
                const adminResponse = await apiService.getAdminStats();
                setAdminStats(adminResponse.data);
            } catch (error) {
                setAdminStats({ 
                    error: true, 
                    message: error.message,
                    status: error.response?.status
                });
            }
            
        } catch (error) {
            console.error('Session test failed:', error);
        }
        
        setLoading(false);
    };

    useEffect(() => {
        runSessionTest();
    }, []);

    const renderResult = (title, data, isError = false) => {
        return (
            <div style={{ 
                margin: '15px 0', 
                padding: '15px', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: isError ? '#ffebee' : '#f8f9fa'
            }}>
                <h3 style={{ margin: '0 0 10px 0', color: isError ? '#d32f2f' : '#333' }}>
                    {title}
                </h3>
                <pre style={{ 
                    background: '#fff', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px',
                    margin: 0
                }}>
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px' }}>
            <h1>Session & Authentication Test</h1>
            <p>This component tests the session integration between React and PHP.</p>
            
            <button 
                onClick={runSessionTest} 
                disabled={loading}
                style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                }}
            >
                {loading ? 'Running Tests...' : 'Run Session Test'}
            </button>

            {loading && (
                <div style={{ margin: '20px 0', color: '#666' }}>
                    <p>🔄 Testing session and API connectivity...</p>
                </div>
            )}

            <div style={{ marginTop: '30px' }}>
                {sessionData && renderResult('1. Session Status', sessionData)}
                
                {publicStats && renderResult('2. Public Stats API', publicStats)}
                
                {adminStats && renderResult(
                    '3. Admin Stats API', 
                    adminStats, 
                    adminStats.error
                )}
            </div>

            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                backgroundColor: '#e3f2fd', 
                borderRadius: '8px',
                border: '1px solid #2196f3'
            }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#1976d2' }}>
                    🔍 Diagnosis Guide
                </h3>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    <p><strong>✅ Success Indicators:</strong></p>
                    <ul>
                        <li>Session shows: <code>is_logged_in: true</code> and <code>role: "admin"</code></li>
                        <li>Public Stats returns real data (jobs, departments, applications)</li>
                        <li>Admin Stats returns real data without errors</li>
                    </ul>
                    
                    <p><strong>❌ Problem Indicators:</strong></p>
                    <ul>
                        <li>Session shows: <code>session_data: []</code> or <code>is_logged_in: false</code></li>
                        <li>Admin Stats returns 401 error or empty data</li>
                        <li>Different session IDs between requests</li>
                    </ul>
                    
                    <p><strong>🔧 If Problems Persist:</strong></p>
                    <ul>
                        <li>Clear browser cookies and cache</li>
                        <li>Restart React development server</li>
                        <li>Login again through React interface</li>
                        <li>Check browser Network tab for cookie headers</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SessionTest;
