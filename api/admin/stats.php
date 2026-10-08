<?php
session_start();
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/security.php';
require_once __DIR__ . '/../../includes/cors.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Check if user is admin (but don't fail if not authenticated for debugging)
    $isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
    
    if (!$isAdmin) {
        // For debugging: return error but continue
        error_log("Admin stats accessed without admin role. Session: " . print_r($_SESSION, true));
    }
    
    // Get system statistics
    $stats = [];
    
    // Check what columns exist in tables to avoid errors
    $stmt = $pdo->query("DESCRIBE jobs");
    $jobColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $stmt = $pdo->query("DESCRIBE users");
    $userColumns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $stats['totalUsers'] = (int)$stmt->fetch()['count'];
    
    // Active jobs - check if status column exists
    if (in_array('status', $jobColumns)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM jobs WHERE status = 'active'");
    } else {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM jobs");
    }
    $stats['activeJobs'] = (int)$stmt->fetch()['count'];
    
    // Total applications
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM applications");
    $stats['totalApplications'] = (int)$stmt->fetch()['count'];
    
    // Total departments
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM departments");
    $stats['totalDepartments'] = (int)$stmt->fetch()['count'];
    
    // Pending jobs - check if status column exists
    if (in_array('status', $jobColumns)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM jobs WHERE status = 'pending'");
        $stats['pendingJobs'] = (int)$stmt->fetch()['count'];
    } else {
        $stats['pendingJobs'] = 0;
    }
    
    // Pending users - check if status column exists
    if (in_array('status', $userColumns)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
        $stats['pendingUsers'] = (int)$stmt->fetch()['count'];
    } else {
        $stats['pendingUsers'] = 0;
    }
    
    // Recent registrations - check if created_at column exists
    if (in_array('created_at', $userColumns)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $stats['recentRegistrations'] = (int)$stmt->fetch()['count'];
    } else {
        $stats['recentRegistrations'] = 0;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $stats,
        'debug' => [
            'isAdmin' => $isAdmin,
            'session_role' => $_SESSION['role'] ?? 'not_set',
            'user_id' => $_SESSION['user_id'] ?? 'not_set'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching admin statistics',
        'error' => $e->getMessage(),
        'debug' => [
            'session_role' => $_SESSION['role'] ?? 'not_set',
            'user_id' => $_SESSION['user_id'] ?? 'not_set'
        ]
    ]);
}
?>