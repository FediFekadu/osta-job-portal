<?php
/**
 * Centralized CORS Handler
 * This file handles Cross-Origin Resource Sharing (CORS) headers
 * for all API endpoints in the OSTA Job Portal
 */

// Get the origin of the request
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// List of allowed origins
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3004',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3004'
];

// Check if the origin is allowed
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // For development, allow localhost variations
    if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN');
header('Access-Control-Max-Age: 86400'); // 24 hours

// Configure session cookies for cross-origin requests BEFORE starting session
if (session_status() === PHP_SESSION_NONE) {
    // Set session cookie parameters to work across localhost domains
    session_set_cookie_params([
        'lifetime' => 0, // Session cookie
        'path' => '/',
        'domain' => 'localhost', // Use localhost domain for both localhost and localhost:3000
        'secure' => false, // Set to true for HTTPS
        'httponly' => false, // Allow JavaScript access for debugging
        'samesite' => 'Lax' // Lax works better for localhost development
    ]);
    
    // Set session name to be consistent
    session_name('OSTA_SESSION');
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
?>
