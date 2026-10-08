<?php
/**
 * Create Employer Profile Tables
 */

require_once 'config/database.php';

echo "<h2>Creating Employer Profile Tables</h2>";

try {
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
    echo "✅ Employer profiles table created/verified<br>";

    // Update users table to ensure it has all needed columns
    $alter_users = "
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ";
    
    try {
        $pdo->exec($alter_users);
        echo "✅ Users table columns updated<br>";
    } catch (Exception $e) {
        echo "ℹ️ Users table already has required columns<br>";
    }

    echo "<h3>✅ Database Setup Complete!</h3>";
    echo "<p>Employer profile tables are ready for use.</p>";

} catch (Exception $e) {
    echo "<h3>❌ Error: " . $e->getMessage() . "</h3>";
}
?>
