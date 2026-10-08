<?php
/**
 * Serve React App from PHP Server - No CORS Issues
 * This eliminates CORS completely by serving everything from same origin
 */

// Start session for authentication
session_start();

// Check if we're accessing an API endpoint
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = $_SERVER['SCRIPT_NAME'];

// If it's an API call, handle it normally
if (strpos($request_uri, '/api/') !== false) {
    // Let the API handle the request
    return false;
}

// For all other requests, serve the React app
$react_build_path = __DIR__ . '/react-frontend/build';
$react_index = $react_build_path . '/index.html';

// Check if React build exists
if (!file_exists($react_index)) {
    echo "<h1>React App Not Built</h1>";
    echo "<p>Please run 'npm run build' in the react-frontend directory first.</p>";
    echo "<p>Or use the development server with 'npm start'</p>";
    exit;
}

// Serve React index.html for all non-API routes
header('Content-Type: text/html');
readfile($react_index);
?>
