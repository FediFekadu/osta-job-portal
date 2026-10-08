<?php
// API Debug Script - helps diagnose authentication and session issues
session_start();

header('Content-Type: application/json');

$debug_info = [
    'session_status' => session_status(),
    'session_id' => session_id(),
    'session_data' => $_SESSION ?? [],
    'server_info' => [
        'REQUEST_METHOD' => $_SERVER['REQUEST_METHOD'] ?? 'not set',
        'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'not set',
        'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'not set',
        'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? 'not set',
        'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'not set'
    ],
    'php_info' => [
        'version' => phpversion(),
        'session_save_path' => session_save_path(),
        'session_name' => session_name(),
        'session_cookie_params' => session_get_cookie_params()
    ]
];

// Test database connection
try {
    require_once 'config/database.php';
    $pdo = getDBConnection();
    $debug_info['database'] = [
        'status' => 'connected',
        'message' => 'Database connection successful'
    ];
    
    // Test users table
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users");
        $stmt->execute();
        $userCount = $stmt->fetch()['count'];
        $debug_info['database']['users_count'] = $userCount;
    } catch (Exception $e) {
        $debug_info['database']['users_error'] = $e->getMessage();
    }
    
    // Test jobs table
    try {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM jobs");
        $stmt->execute();
        $jobCount = $stmt->fetch()['count'];
        $debug_info['database']['jobs_count'] = $jobCount;
    } catch (Exception $e) {
        $debug_info['database']['jobs_error'] = $e->getMessage();
    }
    
} catch (Exception $e) {
    $debug_info['database'] = [
        'status' => 'error',
        'message' => $e->getMessage()
    ];
}

// Check if admin user exists
if (isset($pdo)) {
    try {
        $stmt = $pdo->prepare("SELECT id, username, email, role FROM users WHERE role = 'admin' LIMIT 1");
        $stmt->execute();
        $admin = $stmt->fetch();
        if ($admin) {
            $debug_info['admin_user'] = [
                'exists' => true,
                'id' => $admin['id'],
                'username' => $admin['username'],
                'email' => $admin['email']
            ];
        } else {
            $debug_info['admin_user'] = [
                'exists' => false,
                'message' => 'No admin user found'
            ];
        }
    } catch (Exception $e) {
        $debug_info['admin_user'] = [
            'error' => $e->getMessage()
        ];
    }
}

// Authentication status
$debug_info['authentication'] = [
    'is_logged_in' => isset($_SESSION['user_id']),
    'user_id' => $_SESSION['user_id'] ?? 'not set',
    'role' => $_SESSION['role'] ?? 'not set',
    'username' => $_SESSION['username'] ?? 'not set',
    'email' => $_SESSION['email'] ?? 'not set'
];

// CORS headers check
$debug_info['cors'] = [
    'origin_header' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
    'access_control_headers' => []
];

// Check if CORS file exists
if (file_exists('includes/cors.php')) {
    $debug_info['cors']['cors_file_exists'] = true;
} else {
    $debug_info['cors']['cors_file_exists'] = false;
}

echo json_encode($debug_info, JSON_PRETTY_PRINT);
?>
