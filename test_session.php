<?php
/**
 * Session Diagnostic Script
 * Use this to debug authentication and session issues
 */

require_once 'includes/cors.php';

header('Content-Type: application/json');

try {
    // Start session
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $session_data = $_SESSION;
    $session_id = session_id();
    $session_status = session_status();
    
    // Check authentication status
    $is_authenticated = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    
    // Get session configuration
    $session_config = [
        'session.cookie_lifetime' => ini_get('session.cookie_lifetime'),
        'session.cookie_path' => ini_get('session.cookie_path'),
        'session.cookie_domain' => ini_get('session.cookie_domain'),
        'session.cookie_secure' => ini_get('session.cookie_secure'),
        'session.cookie_httponly' => ini_get('session.cookie_httponly'),
        'session.cookie_samesite' => ini_get('session.cookie_samesite'),
        'session.use_cookies' => ini_get('session.use_cookies'),
        'session.use_only_cookies' => ini_get('session.use_only_cookies'),
    ];

    $response = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'session_info' => [
            'session_id' => $session_id,
            'session_status' => $session_status,
            'session_status_text' => [
                PHP_SESSION_DISABLED => 'PHP_SESSION_DISABLED',
                PHP_SESSION_NONE => 'PHP_SESSION_NONE', 
                PHP_SESSION_ACTIVE => 'PHP_SESSION_ACTIVE'
            ][$session_status] ?? 'UNKNOWN',
            'is_authenticated' => $is_authenticated,
            'session_data_keys' => array_keys($session_data),
            'session_data' => $session_data
        ],
        'session_config' => $session_config,
        'server_info' => [
            'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'],
            'HTTP_ORIGIN' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
            'HTTP_REFERER' => $_SERVER['HTTP_REFERER'] ?? 'not set',
            'HTTP_USER_AGENT' => $_SERVER['HTTP_USER_AGENT'] ?? 'not set',
            'REMOTE_ADDR' => $_SERVER['REMOTE_ADDR'] ?? 'not set'
        ],
        'cookies' => $_COOKIE
    ];

    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
