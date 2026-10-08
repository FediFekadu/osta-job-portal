<?php
require_once __DIR__ . '/includes/cors.php';

// Start session with consistent naming (CORS file sets session_name)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

// Get all session information
$sessionInfo = [
    'session_id' => session_id(),
    'session_name' => session_name(),
    'session_data' => $_SESSION,
    'user_id' => $_SESSION['user_id'] ?? null,
    'role' => $_SESSION['role'] ?? null,
    'is_logged_in' => $_SESSION['is_logged_in'] ?? false,
    'is_admin' => (isset($_SESSION['role']) && $_SESSION['role'] === 'admin'),
    'cookies' => $_COOKIE,
    'headers' => getallheaders()
];

echo json_encode($sessionInfo, JSON_PRETTY_PRINT);
?>