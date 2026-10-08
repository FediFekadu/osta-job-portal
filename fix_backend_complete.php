<?php
/**
 * Complete Backend Fix - Resolve All 500 Errors
 */

echo "<h1>OSTA Job Portal - Complete Backend Fix</h1>";

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

try {
    // Step 1: Database Connection
    echo "<h2>Step 1: Database Connection</h2>";
    $host = 'localhost';
    $username = 'root';
    $db_password = '';
    $dbname = 'osta_job_portal';

    $pdo = new PDO("mysql:host={$host};dbname={$dbname}", $username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    echo "✅ Database connection successful<br>";

    // Step 2: Create/Verify Users Table
    echo "<h2>Step 2: Users Table Setup</h2>";
    $create_users_table = "
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'employer', 'applicant') NOT NULL DEFAULT 'applicant',
        status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($create_users_table);
    echo "✅ Users table created/verified<br>";

    // Step 3: Create/Verify Departments Table
    echo "<h2>Step 3: Departments Table Setup</h2>";
    $create_departments_table = "
    CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($create_departments_table);
    echo "✅ Departments table created/verified<br>";

    // Step 4: Create/Verify Jobs Table
    echo "<h2>Step 4: Jobs Table Setup</h2>";
    $create_jobs_table = "
    CREATE TABLE IF NOT EXISTS jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        department_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        employment_type ENUM('full_time', 'part_time', 'contract') NOT NULL,
        location VARCHAR(100) NOT NULL,
        salary_range VARCHAR(50),
        deadline DATE NOT NULL,
        status ENUM('pending', 'approved', 'expired') DEFAULT 'pending',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
    )";
    
    $pdo->exec($create_jobs_table);
    echo "✅ Jobs table created/verified<br>";

    // Step 5: Create Admin User
    echo "<h2>Step 5: Admin User Setup</h2>";
    $admin_email = 'admin@osta.gov';
    $admin_password = 'admin123';
    $admin_name = 'System Administrator';

    // Check if admin exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$admin_email]);
    
    if (!$stmt->fetch()) {
        // Create admin user
        $hashed_password = password_hash($admin_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, 'admin', 'active')");
        $stmt->execute([$admin_name, $admin_email, $hashed_password]);
        echo "✅ Admin user created successfully<br>";
    } else {
        echo "✅ Admin user already exists<br>";
    }

    // Step 6: Create Sample Department
    echo "<h2>Step 6: Sample Data Setup</h2>";
    $stmt = $pdo->prepare("SELECT id FROM departments WHERE name = 'Information Technology'");
    $stmt->execute();
    
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("INSERT INTO departments (name, description) VALUES ('Information Technology', 'IT Department for technical positions')");
        $stmt->execute();
        echo "✅ Sample department created<br>";
    } else {
        echo "✅ Sample department already exists<br>";
    }

    // Step 7: Test Authentication
    echo "<h2>Step 7: Authentication Test</h2>";
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$admin_email]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($admin_password, $user['password'])) {
        echo "✅ Admin authentication test successful<br>";
        echo "<strong>Login Credentials:</strong><br>";
        echo "Email: {$admin_email}<br>";
        echo "Password: {$admin_password}<br>";
    } else {
        echo "❌ Admin authentication test failed<br>";
    }

    echo "<h2>✅ Backend Setup Complete!</h2>";
    echo "<p><strong>Your React app should now work without 500 errors.</strong></p>";
    echo "<p>Test the login with: admin@osta.gov / admin123</p>";

} catch (Exception $e) {
    echo "<h2>❌ Error: " . $e->getMessage() . "</h2>";
    echo "<p>Please check your XAMPP MySQL service and database configuration.</p>";
}
?>
