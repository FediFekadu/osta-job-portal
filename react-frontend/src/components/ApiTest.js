import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ApiTest = () => {
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState(false);

    const runTests = async () => {
        setLoading(true);
        const results = {};

        // Test 1: Basic connection test
        try {
            console.log('Testing basic connection...');
            const connectionTest = await apiService.testConnection();
            results.connection = { success: true, data: connectionTest };
        } catch (error) {
            results.connection = { success: false, error: error.message };
        }

        // Test 2: Stats API
        try {
            console.log('Testing stats API...');
            const stats = await apiService.getStats();
            results.stats = { success: true, data: stats };
        } catch (error) {
            results.stats = { success: false, error: error.message };
        }

        // Test 3: Departments API
        try {
            console.log('Testing departments API...');
            const departments = await apiService.getDepartments();
            results.departments = { success: true, data: departments };
        } catch (error) {
            results.departments = { success: false, error: error.message };
        }

        // Test 4: Jobs API
        try {
            console.log('Testing jobs API...');
            const jobs = await apiService.getJobs();
            results.jobs = { success: true, data: jobs };
        } catch (error) {
            results.jobs = { success: false, error: error.message };
        }

        setTestResults(results);
        setLoading(false);
    };

    useEffect(() => {
        runTests();
    }, []);

    const renderTestResult = (testName, result) => {
        if (!result) return null;

        return (
            <div key={testName} style={{ 
                margin: '10px 0', 
                padding: '10px', 
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: result.success ? '#e8f5e9' : '#ffebee'
            }}>
                <h3>{testName} Test</h3>
                <p><strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}</p>
                {result.success ? (
                    <div>
                        <p><strong>Data:</strong></p>
                        <pre style={{ 
                            background: '#f5f5f5', 
                            padding: '10px', 
                            borderRadius: '3px',
                            overflow: 'auto',
                            maxHeight: '200px'
                        }}>
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <p><strong>Error:</strong> {result.error}</p>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>API Connection Test</h1>
            <p>This component tests the connection between React frontend and PHP backend APIs.</p>
            
            <button 
                onClick={runTests} 
                disabled={loading}
                style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                }}
            >
                {loading ? 'Running Tests...' : 'Run Tests Again'}
            </button>

            {loading && <p>Running API tests...</p>}

            <div style={{ marginTop: '20px' }}>
                {Object.entries(testResults).map(([testName, result]) => 
                    renderTestResult(testName, result)
                )}
            </div>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                <h3>Debugging Information</h3>
                <p><strong>Current URL:</strong> {window.location.href}</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            </div>
        </div>
    );
};

export default ApiTest;
