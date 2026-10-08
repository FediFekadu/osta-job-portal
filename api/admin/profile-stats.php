<?php
require_once '../../config/database.php';
require_once '../../includes/cors.php';

handleCORS();

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Get profile statistics
    $stats = [];
    
    // Total users
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users");
    $stmt->execute();
    $stats['total'] = $stmt->fetchColumn();
    
    // Active users
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE status = 'active'");
    $stmt->execute();
    $stats['active'] = $stmt->fetchColumn();
    
    // Inactive users
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE status = 'inactive'");
    $stmt->execute();
    $stats['inactive'] = $stmt->fetchColumn();
    
    // Verified users
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE verified = 1");
    $stmt->execute();
    $stats['verified'] = $stmt->fetchColumn();
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
