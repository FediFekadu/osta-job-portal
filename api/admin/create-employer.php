<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

// Check if user is admin
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getDBConnection();
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['company_name']) || !isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Company name, email, and password required']);
        exit;
    }
    
    // Extract variables from input
    $company_name = $input['company_name'];
    $email = $input['email'];
    $password = $input['password'];
    $username = $input['username'] ?? strtolower(str_replace(' ', '', $company_name)) . rand(100, 999);
    $first_name = $input['first_name'] ?? '';
    $last_name = $input['last_name'] ?? '';
    $phone = $input['phone'] ?? '';
    $company_description = $input['company_description'] ?? '';
    $industry = $input['industry'] ?? '';
    $company_size = $input['company_size'] ?? '';
    $website = $input['website'] ?? '';
    $address = $input['address'] ?? '';
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Validate password strength
    if (strlen($password) < 6) {
        throw new Exception('Password must be at least 6 characters long');
    }
    
    // Check if username already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        throw new Exception('Username already exists');
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        throw new Exception('Email already exists');
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Insert new employer user
        $stmt = $pdo->prepare("
            INSERT INTO users (username, first_name, last_name, email, phone, role, password, status, created_at) 
            VALUES (?, ?, ?, ?, ?, 'employer', ?, 'active', NOW())
        ");
        
        $stmt->execute([
            $username,
            $first_name,
            $last_name,
            $email,
            $phone,
            $hashed_password
        ]);
        
        $user_id = $pdo->lastInsertId();
        
        // Create employer profile entry
        $stmt = $pdo->prepare("
            INSERT INTO employer_profiles (user_id, company_name, company_description, industry, company_size, website, address, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $user_id,
            $company_name,
            $company_description,
            $industry,
            $company_size,
            $website,
            $address
        ]);
        
        // Commit transaction
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Employer account created successfully',
            'employer' => [
                'id' => $user_id,
                'username' => $username,
                'first_name' => $first_name,
                'last_name' => $last_name,
                'email' => $email,
                'company_name' => $company_name
            ],
            'credentials' => [
                'username' => $username,
                'password' => $password // Show password to admin so they can share it
            ]
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
