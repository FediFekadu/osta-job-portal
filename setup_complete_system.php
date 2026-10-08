<?php
/**
 * Complete System Setup and Verification Script
 * Run this script to set up the entire user management system
 */

require_once 'config/database.php';

echo "<h1>OSTA Job Portal - Complete System Setup</h1>";
echo "<style>
body { font-family: Arial, sans-serif; margin: 20px; }
.success { color: green; font-weight: bold; }
.error { color: red; font-weight: bold; }
.info { color: blue; }
.section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
</style>";

try {
    echo "<div class='section'>";
    echo "<h2>Step 1: Database Connection Test</h2>";
    
    // Test database connection
    $stmt = $pdo->query("SELECT 1");
    echo "<p class='success'>✅ Database connection successful</p>";
    
    echo "<h2>Step 2: Create/Verify Tables</h2>";
    
    // Create users table
    $create_users = "
    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role ENUM('admin', 'employer', 'applicant') DEFAULT 'applicant',
        status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($create_users);
    echo "<p class='success'>✅ Users table created/verified</p>";
    
    // Create departments table
    $create_departments = "
    CREATE TABLE IF NOT EXISTS departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    
    $pdo->exec($create_departments);
    echo "<p class='success'>✅ Departments table created/verified</p>";
    
    // Create employer_profiles table
    $create_employer_profiles = "
    CREATE TABLE IF NOT EXISTS employer_profiles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        address TEXT,
        department_id INT,
        website VARCHAR(255),
        company_size ENUM('1-10', '11-50', '51-200', '201-500', '500+'),
        industry VARCHAR(100),
        description TEXT,
        logo_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    )";
    
    $pdo->exec($create_employer_profiles);
    echo "<p class='success'>✅ Employer profiles table created/verified</p>";
    
    // Create jobs table
    $create_jobs = "
    CREATE TABLE IF NOT EXISTS jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        location VARCHAR(255),
        salary_range VARCHAR(100),
        job_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
        department_id INT,
        employer_id INT NOT NULL,
        status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    $pdo->exec($create_jobs);
    echo "<p class='success'>✅ Jobs table created/verified</p>";
    
    echo "<h2>Step 3: Create Admin User</h2>";
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute(['admin@osta.gov']);
    $admin_exists = $stmt->fetch();
    
    if (!$admin_exists) {
        // Create admin user
        $admin_password = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            INSERT INTO users (full_name, email, password, role, status) 
            VALUES (?, ?, ?, 'admin', 'active')
        ");
        $stmt->execute(['OSTA Administrator', 'admin@osta.gov', $admin_password]);
        echo "<p class='success'>✅ Admin user created</p>";
    } else {
        echo "<p class='info'>ℹ️ Admin user already exists</p>";
    }
    
    echo "<h2>Step 4: Create Sample Departments</h2>";
    
    $sample_departments = [
        ['Information Technology', 'Technology and software development positions'],
        ['Human Resources', 'HR and administrative positions'],
        ['Finance', 'Financial and accounting positions'],
        ['Marketing', 'Marketing and communications positions'],
        ['Operations', 'Operations and logistics positions']
    ];
    
    foreach ($sample_departments as $dept) {
        $stmt = $pdo->prepare("SELECT id FROM departments WHERE name = ?");
        $stmt->execute([$dept[0]]);
        if (!$stmt->fetch()) {
            $stmt = $pdo->prepare("INSERT INTO departments (name, description) VALUES (?, ?)");
            $stmt->execute($dept);
            echo "<p class='success'>✅ Created department: {$dept[0]}</p>";
        } else {
            echo "<p class='info'>ℹ️ Department already exists: {$dept[0]}</p>";
        }
    }
    
    echo "<h2>Step 5: System Verification</h2>";
    
    // Count records
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $user_count = $stmt->fetch()['count'];
    echo "<p class='info'>📊 Total users: {$user_count}</p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM departments");
    $dept_count = $stmt->fetch()['count'];
    echo "<p class='info'>📊 Total departments: {$dept_count}</p>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM employer_profiles");
    $profile_count = $stmt->fetch()['count'];
    echo "<p class='info'>📊 Total employer profiles: {$profile_count}</p>";
    
    echo "</div>";
    
    echo "<div class='section'>";
    echo "<h2>🎉 Setup Complete!</h2>";
    echo "<h3>Login Credentials:</h3>";
    echo "<p><strong>Admin Login:</strong></p>";
    echo "<ul>";
    echo "<li>Email: admin@osta.gov</li>";
    echo "<li>Password: admin123</li>";
    echo "</ul>";
    
    echo "<h3>Next Steps:</h3>";
    echo "<ol>";
    echo "<li>Start your React development server: <code>npm start</code></li>";
    echo "<li>Login as admin and create employer accounts</li>";
    echo "<li>Test employer login and profile management</li>";
    echo "<li>Test job seeker registration</li>";
    echo "</ol>";
    
    echo "<h3>System Features Ready:</h3>";
    echo "<ul>";
    echo "<li>✅ Admin can create employer accounts with auto-generated credentials</li>";
    echo "<li>✅ Employers can login and change their password/email</li>";
    echo "<li>✅ Job seekers can self-register and login</li>";
    echo "<li>✅ Professional CSS applied to all components</li>";
    echo "<li>✅ Role-based dashboard redirection</li>";
    echo "</ul>";
    echo "</div>";
    
} catch (Exception $e) {
    echo "<div class='section'>";
    echo "<h2 class='error'>❌ Setup Error</h2>";
    echo "<p class='error'>Error: " . $e->getMessage() . "</p>";
    echo "</div>";
}
?>
