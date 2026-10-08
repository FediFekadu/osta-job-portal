<?php
/**
 * Backend Test Script - Debug 500 Errors
 */

echo "<h2>Backend Debugging</h2>";

// Test 1: Database Connection
echo "<h3>1. Database Connection Test</h3>";
try {
    require_once 'config/database.php';
    echo "✅ Database connection successful<br>";
    echo "✅ Variables available: host={$host}, username={$username}, dbname={$dbname}<br>";
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
}

// Test 2: Check if users table exists
echo "<h3>2. Users Table Test</h3>";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users table exists with {$result['count']} records<br>";
} catch (Exception $e) {
    echo "❌ Users table error: " . $e->getMessage() . "<br>";
}

// Test 3: Check admin user
echo "<h3>3. Admin User Test</h3>";
try {
    $stmt = $pdo->prepare("SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1");
    $stmt->execute();
    $admin = $stmt->fetch();
    if ($admin) {
        echo "✅ Admin user found: {$admin['email']} (ID: {$admin['id']})<br>";
    } else {
        echo "❌ No admin user found<br>";
    }
} catch (Exception $e) {
    echo "❌ Admin user check error: " . $e->getMessage() . "<br>";
}

// Test 4: Test JSON input parsing
echo "<h3>4. JSON Input Test</h3>";
$test_json = '{"email":"admin@osta.gov","password":"admin123"}';
$parsed = json_decode($test_json, true);
if ($parsed && isset($parsed['email'])) {
    echo "✅ JSON parsing works<br>";
} else {
    echo "❌ JSON parsing failed<br>";
}

// Test 5: Test session
echo "<h3>5. Session Test</h3>";
session_start();
$_SESSION['test'] = 'working';
if (isset($_SESSION['test'])) {
    echo "✅ Sessions working<br>";
} else {
    echo "❌ Sessions not working<br>";
}

echo "<h3>6. PHP Error Reporting</h3>";
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
echo "✅ Error reporting enabled<br>";

echo "<h3>Test Complete</h3>";
echo "<p>If all tests pass, the backend should work. If not, check the specific errors above.</p>";
?>
