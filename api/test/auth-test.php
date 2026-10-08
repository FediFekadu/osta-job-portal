<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    
    echo "Database Connection: ✓ Success\n";
    
    // Check if users table exists and has data
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "Users table: ✓ Exists\n";
        
        // Check admin user
        $stmt = $pdo->prepare("SELECT id, email, role, status FROM users WHERE role = 'admin' LIMIT 1");
        $stmt->execute();
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin) {
            echo "Admin user: ✓ Found (ID: {$admin['id']}, Email: {$admin['email']}, Status: {$admin['status']})\n";
        } else {
            echo "Admin user: ✗ Not found\n";
        }
        
        // Check total users
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $userCount = $stmt->fetchColumn();
        echo "Total users: $userCount\n";
        
    } else {
        echo "Users table: ✗ Not found\n";
    }
    
    // Test session
    session_start();
    echo "Session ID: " . session_id() . "\n";
    echo "Session data: " . json_encode($_SESSION) . "\n";
    
    echo "\nAuthentication test completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
