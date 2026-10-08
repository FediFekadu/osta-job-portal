<?php
// Simple API Connection Test
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Test if this endpoint is reachable from React
echo json_encode([
    'success' => true,
    'message' => 'API connection test successful',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => PHP_VERSION,
        'request_method' => $_SERVER['REQUEST_METHOD'],
        'request_uri' => $_SERVER['REQUEST_URI'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ]
]);
?>
