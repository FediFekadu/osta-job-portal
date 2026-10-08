<?php
// Test login session setting
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/includes/cors.php';
require_once __DIR__ . '/config/database.php';

// Configure session for cross-origin requests
ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', '0');
ini_set('session.cookie_httponly', '1');
ini_set('session.use_strict_mode', '1');

session_start();

echo "<h1>Login Session Test</h1>";

// Test 1: Check current session
echo "<h2>1. Current Session Status</h2>";
echo "<pre>";
echo "Session ID: " . session_id() . "\n";
echo "Session Data: " . print_r($_SESSION, true) . "\n";
echo "</pre>";

// Test 2: Simulate login process
echo "<h2>2. Simulating Login Process</h2>";

try {
    $pdo = getDBConnection();
    
    // Get admin user
    $stmt = $pdo->prepare("SELECT id, email, password, role, full_name FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute(['admin@osta.gov']);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p>✅ Admin user found:</p>";
        echo "<pre>" . print_r($user, true) . "</pre>";
        
        // Test password verification
        $testPassword = 'admin123';
        $passwordValid = password_verify($testPassword, $user['password']);
        echo "<p>Password verification: " . ($passwordValid ? "✅ VALID" : "❌ INVALID") . "</p>";
        
        if ($passwordValid) {
            // Simulate setting session variables
            echo "<h3>Setting Session Variables:</h3>";
            
            // Regenerate session ID
            session_regenerate_id(true);
            echo "<p>New Session ID: " . session_id() . "</p>";
            
            // Set session variables exactly like login API
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $user['email'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['is_logged_in'] = true;
            $_SESSION['last_activity'] = time();
            
            echo "<p>✅ Session variables set</p>";
            
            // Force session write
            session_write_close();
            session_start();
            
            echo "<h3>Session After Setting:</h3>";
            echo "<pre>" . print_r($_SESSION, true) . "</pre>";
            
            // Test admin check
            $isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
            echo "<p>Admin check: " . ($isAdmin ? "✅ IS ADMIN" : "❌ NOT ADMIN") . "</p>";
            
        }
    } else {
        echo "<p>❌ Admin user not found</p>";
    }
    
} catch (Exception $e) {
    echo "<p>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<h2>3. Final Session Status</h2>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
h1, h2, h3 { color: #333; }
pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; }
p { margin: 10px 0; }
</style>
