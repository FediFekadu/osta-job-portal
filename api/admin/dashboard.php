<?php
session_start();
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/security.php';
require_once '../../includes/cors.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_role('admin');
set_security_headers();

try {
    // Get admin dashboard data
    $stats = [];
    
    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $stats['totalUsers'] = $stmt->fetch()['count'];
    
    // Active jobs
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'");
    $stats['activeJobs'] = $stmt->fetch()['count'];
    
    // Total applications
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM applications");
    $stats['totalApplications'] = $stmt->fetch()['count'];
    
    // Pending jobs
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM jobs WHERE status = 'pending'");
    $stats['pendingJobs'] = $stmt->fetch()['count'];
    
    // Pending users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
    $stats['pendingUsers'] = $stmt->fetch()['count'];
    
    // Recent registrations (last 30 days)
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stats['recentRegistrations'] = $stmt->fetch()['count'];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Admin dashboard error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>
