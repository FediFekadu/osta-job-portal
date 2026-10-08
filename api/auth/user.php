<?php
require_once '../../includes/cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Start session with proper configuration
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Debug session data (remove in production)
    error_log("Session data: " . print_r($_SESSION, true));

    // Check if user is logged in with more detailed validation
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        error_log("Authentication failed - Session logged_in: " . (isset($_SESSION['logged_in']) ? $_SESSION['logged_in'] : 'not set'));
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Not authenticated',
            'debug' => [
                'session_id' => session_id(),
                'logged_in' => isset($_SESSION['logged_in']) ? $_SESSION['logged_in'] : 'not set',
                'session_data' => array_keys($_SESSION)
            ]
        ]);
        exit;
    }

    // Validate required session data
    $required_fields = ['user_id', 'user_name', 'user_email', 'role'];
    $missing_fields = [];
    
    foreach ($required_fields as $field) {
        if (!isset($_SESSION[$field])) {
            $missing_fields[] = $field;
        }
    }

    if (!empty($missing_fields)) {
        error_log("Missing session fields: " . implode(', ', $missing_fields));
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Incomplete session data',
            'debug' => [
                'missing_fields' => $missing_fields,
                'available_fields' => array_keys($_SESSION)
            ]
        ]);
        exit;
    }

    // Return user data from session
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'],
            'email' => $_SESSION['user_email'],
            'role' => $_SESSION['role']
        ]
    ]);

} catch (Exception $e) {
    error_log("User.php error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
