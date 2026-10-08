<?php
require_once 'config/database.php';

echo "<h2>OSTA Job Portal - Authentication Setup</h2>";

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p>✅ Database connection successful</p>";

    // Check if users table exists and has correct structure
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<p>✅ Users table exists with columns: " . implode(', ', $columns) . "</p>";

    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id, email, role FROM users WHERE role = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($admin) {
        echo "<p>✅ Admin user found: " . $admin['email'] . " (ID: " . $admin['id'] . ")</p>";
    } else {
        // Create admin user
        $admin_email = 'admin@osta.gov';
        $admin_password = 'admin123';
        $admin_name = 'System Administrator';
        $hashed_password = password_hash($admin_password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role, status, created_at) VALUES (?, ?, ?, 'admin', 'active', NOW())");
        $stmt->execute([$admin_name, $admin_email, $hashed_password]);

        echo "<p>✅ Admin user created successfully!</p>";
        echo "<p><strong>Admin Credentials:</strong></p>";
        echo "<p>Email: $admin_email</p>";
        echo "<p>Password: $admin_password</p>";
    }

    // Test password verification
    $stmt = $pdo->prepare("SELECT password FROM users WHERE email = 'admin@osta.gov'");
    $stmt->execute();
    $stored_hash = $stmt->fetchColumn();

    if ($stored_hash && password_verify('admin123', $stored_hash)) {
        echo "<p>✅ Password verification test successful</p>";
    } else {
        echo "<p>❌ Password verification test failed</p>";
    }

    echo "<h3>Test Authentication:</h3>";
    echo "<p>You can now test login with:</p>";
    echo "<p><strong>Email:</strong> admin@osta.gov</p>";
    echo "<p><strong>Password:</strong> admin123</p>";

} catch (Exception $e) {
    echo "<p>❌ Error: " . $e->getMessage() . "</p>";
}
?>
