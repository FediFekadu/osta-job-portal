<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['full_name']) || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Full name, email and password required']);
        exit;
    }

    $full_name = trim($input['full_name']);
    $email = trim($input['email']);
    $password = $input['password'];
    $phone = isset($input['phone']) ? trim($input['phone']) : '';

    // Basic validation
    if (empty($full_name) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
        exit;
    }

    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit;
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user (applicants only can register themselves)
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, phone, role, status, created_at) VALUES (?, ?, ?, ?, 'applicant', 'active', NOW())");
    $stmt->execute([$full_name, $email, $hashed_password, $phone]);

    $user_id = $pdo->lastInsertId();

    // Start session and log user in
    session_start();
    $_SESSION['user_id'] = $user_id;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $full_name;
    $_SESSION['user_role'] = 'applicant';
    $_SESSION['logged_in'] = true;

    // Return success
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful',
        'user' => [
            'id' => $user_id,
            'name' => $full_name,
            'email' => $email,
            'role' => 'applicant'
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
