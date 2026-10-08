<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../config/database.php';

// Configure session for cross-origin requests
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '0'); // Set to 1 for HTTPS
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    // Debug logging
    error_log("Login API - Raw input: " . $rawInput);
    error_log("Login API - Parsed input: " . print_r($input, true));
    
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Email and password are required',
            'debug' => [
                'raw_input' => $rawInput,
                'parsed_input' => $input
            ]
        ]);
        exit;
    }

    $email = trim($input['email']);
    $password = $input['password'];
    
    // Connect to database
    $pdo = getDBConnection();

    // Check user in database
    $stmt = $pdo->prepare("SELECT id, email, password, role, full_name FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
        exit;
    }

    // Regenerate session ID for security
    session_regenerate_id(true);
    
    // Set session variables
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['email'] = $user['email'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['is_logged_in'] = true;
    $_SESSION['last_activity'] = time();
    
    // Force session write and close to ensure data is saved
    session_write_close();
    
    // Start session again for response
    session_start();
    
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'full_name' => $user['full_name']
        ],
        'debug' => [
            'session_id' => session_id(),
            'session_data' => $_SESSION,
            'cookie_params' => session_get_cookie_params()
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Login API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error: ' . $e->getMessage(),
        'debug' => [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]
    ]);
}
?>
