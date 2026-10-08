<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing login API components...\n\n";

// Test 1: Check if files exist
echo "1. Checking required files:\n";
$corsFile = __DIR__ . '/includes/cors.php';
$dbFile = __DIR__ . '/config/database.php';

echo "CORS file exists: " . (file_exists($corsFile) ? "YES" : "NO") . "\n";
echo "Database file exists: " . (file_exists($dbFile) ? "YES" : "NO") . "\n\n";

// Test 2: Try including files
echo "2. Testing file includes:\n";
try {
    require_once $corsFile;
    echo "CORS included: SUCCESS\n";
} catch (Exception $e) {
    echo "CORS error: " . $e->getMessage() . "\n";
}

try {
    require_once $dbFile;
    echo "Database included: SUCCESS\n";
} catch (Exception $e) {
    echo "Database error: " . $e->getMessage() . "\n";
}

// Test 3: Test database connection
echo "\n3. Testing database connection:\n";
try {
    $pdo = getDBConnection();
    echo "Database connection: SUCCESS\n";
    
    // Test query
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users");
    $stmt->execute();
    $result = $stmt->fetch();
    echo "Users table accessible: YES (found " . $result['count'] . " users)\n";
    
} catch (Exception $e) {
    echo "Database connection error: " . $e->getMessage() . "\n";
}

// Test 4: Test session configuration
echo "\n4. Testing session:\n";
try {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    echo "Session started: SUCCESS (ID: " . session_id() . ")\n";
} catch (Exception $e) {
    echo "Session error: " . $e->getMessage() . "\n";
}

// Test 5: Simulate login API call
echo "\n5. Testing login API simulation:\n";
try {
    $testEmail = 'admin@osta.gov';
    $stmt = $pdo->prepare("SELECT id, email, password, role, full_name FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute([$testEmail]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "Admin user found: YES\n";
        echo "User ID: " . $user['id'] . "\n";
        echo "User role: " . $user['role'] . "\n";
        echo "User name: " . $user['full_name'] . "\n";
    } else {
        echo "Admin user found: NO\n";
        
        // Check what users exist
        $stmt = $pdo->prepare("SELECT email, role FROM users LIMIT 5");
        $stmt->execute();
        $users = $stmt->fetchAll();
        echo "Available users:\n";
        foreach ($users as $u) {
            echo "  - " . $u['email'] . " (" . $u['role'] . ")\n";
        }
    }
    
} catch (Exception $e) {
    echo "Login simulation error: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>
