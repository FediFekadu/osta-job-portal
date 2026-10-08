<?php
require_once 'config/database.php';

header('Content-Type: text/plain');

echo "=== OSTA Job Portal Login Debug ===\n\n";

try {
    // Test database connection
    echo "1. Testing database connection...\n";
    $pdo = getDBConnection();
    echo "   ✓ Database connection successful\n\n";
    
    // Check if users table exists
    echo "2. Checking users table...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "   ✓ Users table exists\n";
        
        // Check table structure
        $stmt = $pdo->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "   Columns: " . implode(', ', $columns) . "\n\n";
        
        // Check for admin user
        echo "3. Checking admin user...\n";
        $stmt = $pdo->prepare("SELECT id, email, role, status, password FROM users WHERE role = 'admin' LIMIT 1");
        $stmt->execute();
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($admin) {
            echo "   ✓ Admin user found:\n";
            echo "     ID: {$admin['id']}\n";
            echo "     Email: {$admin['email']}\n";
            echo "     Role: {$admin['role']}\n";
            echo "     Status: {$admin['status']}\n";
            echo "     Password hash: " . substr($admin['password'], 0, 20) . "...\n\n";
            
            // Test password verification
            echo "4. Testing password verification...\n";
            $test_password = 'admin123';
            if (password_verify($test_password, $admin['password'])) {
                echo "   ✓ Password 'admin123' is correct\n";
            } else {
                echo "   ✗ Password 'admin123' is incorrect\n";
                echo "   Trying to create new password hash...\n";
                $new_hash = password_hash($test_password, PASSWORD_DEFAULT);
                echo "   New hash: $new_hash\n";
                
                // Update password
                $updateStmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                if ($updateStmt->execute([$new_hash, $admin['id']])) {
                    echo "   ✓ Password updated successfully\n";
                } else {
                    echo "   ✗ Failed to update password\n";
                }
            }
        } else {
            echo "   ✗ No admin user found\n";
            echo "   Creating admin user...\n";
            
            $email = 'admin@osta.com';
            $password = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                INSERT INTO users (username, email, full_name, role, password, status, created_at) 
                VALUES (?, ?, ?, 'admin', ?, 'active', NOW())
            ");
            
            if ($stmt->execute(['admin', $email, 'Administrator', $password])) {
                echo "   ✓ Admin user created successfully\n";
                echo "     Email: $email\n";
                echo "     Password: admin123\n";
            } else {
                echo "   ✗ Failed to create admin user\n";
            }
        }
        
        // Test total users
        echo "\n5. User statistics...\n";
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $total = $stmt->fetchColumn();
        echo "   Total users: $total\n";
        
        $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($roles as $role) {
            echo "   {$role['role']}: {$role['count']}\n";
        }
        
    } else {
        echo "   ✗ Users table not found\n";
        echo "   Creating users table...\n";
        
        $createTable = "
        CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            full_name VARCHAR(100),
            role ENUM('admin', 'employer', 'applicant') NOT NULL,
            password VARCHAR(255) NOT NULL,
            status ENUM('active', 'inactive') DEFAULT 'active',
            verified TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP NULL
        )";
        
        if ($pdo->exec($createTable)) {
            echo "   ✓ Users table created\n";
            
            // Create admin user
            $email = 'admin@osta.com';
            $password = password_hash('admin123', PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("
                INSERT INTO users (username, email, full_name, role, password, status, created_at) 
                VALUES (?, ?, ?, 'admin', ?, 'active', NOW())
            ");
            
            if ($stmt->execute(['admin', $email, 'Administrator', $password])) {
                echo "   ✓ Admin user created\n";
            }
        } else {
            echo "   ✗ Failed to create users table\n";
        }
    }
    
    echo "\n6. Testing login API endpoint...\n";
    $login_data = json_encode(['email' => 'admin@osta.com', 'password' => 'admin123']);
    echo "   Login data: $login_data\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "\n=== Debug Complete ===\n";
?>
