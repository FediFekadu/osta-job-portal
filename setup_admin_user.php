<?php
require_once 'config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $pdo = getDBConnection();
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, email, role, status FROM users WHERE email = 'admin@osta.com' AND role = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo json_encode([
            'success' => true,
            'message' => 'Admin user already exists',
            'admin' => $admin
        ]);
    } else {
        // Create admin user
        $password_hash = password_hash('admin123', PASSWORD_DEFAULT);
        
        $stmt = $pdo->prepare("
            INSERT INTO users (username, email, full_name, role, password, status, verified, created_at) 
            VALUES (?, ?, ?, 'admin', ?, 'active', 1, NOW())
        ");
        
        if ($stmt->execute(['admin', 'admin@osta.com', 'Administrator', $password_hash])) {
            $admin_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Admin user created successfully',
                'admin' => [
                    'id' => $admin_id,
                    'email' => 'admin@osta.com',
                    'role' => 'admin',
                    'status' => 'active'
                ],
                'credentials' => [
                    'email' => 'admin@osta.com',
                    'password' => 'admin123'
                ]
            ]);
        } else {
            throw new Exception('Failed to create admin user');
        }
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
