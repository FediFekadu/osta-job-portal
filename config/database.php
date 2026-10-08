<?php

// Database configuration
$host = 'localhost';
$username = 'root';
$db_password = '';
$dbname = 'osta_job_portal';

// Legacy constants for backward compatibility
define('DB_HOST', $host);
define('DB_USER', $username);
define('DB_PASS', $db_password);
define('DB_NAME', $dbname);

// Define Site URL
define('SITE_URL', 'http://localhost/osta_job_portal');

try {
    $pdo = new PDO("mysql:host={$host};dbname={$dbname}", $username, $db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Function to get database connection
function getDBConnection() {
    global $host, $username, $db_password, $dbname;
    
    try {
        $pdo = new PDO("mysql:host={$host};dbname={$dbname}", $username, $db_password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch(PDOException $e) {
        throw new Exception("Connection failed: " . $e->getMessage());
    }
}

// Function to sanitize input
function sanitize($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

// Password functions moved to includes/security.php for better security implementation
?>
