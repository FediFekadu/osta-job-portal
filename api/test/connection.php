<?php
// Test database connection and admin user
require_once '../../includes/cors.php';



if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    require_once '../../config/database.php';
    
    // Test database connection
    $result = ['success' => true, 'tests' => []];
    
    // Test 1: Database connection
    try {
        $stmt = $pdo->query("SELECT 1");
        $result['tests']['database'] = ['status' => 'success', 'message' => 'Database connection successful'];
    } catch (Exception $e) {
        $result['tests']['database'] = ['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()];
        $result['success'] = false;
    }
    
    // Test 2: Check if users table exists
    try {
        $stmt = $pdo->query("DESCRIBE users");
        $result['tests']['users_table'] = ['status' => 'success', 'message' => 'Users table exists'];
    } catch (Exception $e) {
        $result['tests']['users_table'] = ['status' => 'error', 'message' => 'Users table missing: ' . $e->getMessage()];
        $result['success'] = false;
    }
    
    // Test 3: Check admin user
    try {
        $stmt = $pdo->prepare("SELECT id, email, role, status FROM users WHERE email = ?");
        $stmt->execute(['admin@osta.gov']);
        $admin = $stmt->fetch();
        
        if ($admin) {
            $result['tests']['admin_user'] = [
                'status' => 'success', 
                'message' => 'Admin user found',
                'data' => $admin
            ];
        } else {
            $result['tests']['admin_user'] = ['status' => 'error', 'message' => 'Admin user not found'];
            $result['success'] = false;
        }
    } catch (Exception $e) {
        $result['tests']['admin_user'] = ['status' => 'error', 'message' => 'Admin user check failed: ' . $e->getMessage()];
        $result['success'] = false;
    }
    
    // Test 4: List all users
    try {
        $stmt = $pdo->query("SELECT id, email, role, status FROM users LIMIT 5");
        $users = $stmt->fetchAll();
        $result['tests']['user_list'] = [
            'status' => 'success', 
            'message' => 'Found ' . count($users) . ' users',
            'data' => $users
        ];
    } catch (Exception $e) {
        $result['tests']['user_list'] = ['status' => 'error', 'message' => 'User list failed: ' . $e->getMessage()];
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Test script failed: ' . $e->getMessage()
    ]);
}
?>
