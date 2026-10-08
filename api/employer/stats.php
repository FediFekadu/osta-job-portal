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

// Require employer role
require_role('employer');
set_security_headers();

try {
    $user_id = $_SESSION['user_id'];
    
    // Get employer statistics
    $stats = [];
    
    // Active jobs
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM jobs WHERE employer_id = ? AND status = 'active'");
    $stmt->execute([$user_id]);
    $stats['activeJobs'] = $stmt->fetch()['count'];
    
    // Total applications
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        WHERE j.employer_id = ?
    ");
    $stmt->execute([$user_id]);
    $stats['totalApplications'] = $stmt->fetch()['count'];
    
    // Pending reviews
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        WHERE j.employer_id = ? AND a.status = 'pending'
    ");
    $stmt->execute([$user_id]);
    $stats['pendingReviews'] = $stmt->fetch()['count'];
    
    // Hired candidates
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as count 
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        WHERE j.employer_id = ? AND a.status = 'hired'
    ");
    $stmt->execute([$user_id]);
    $stats['hiredCandidates'] = $stmt->fetch()['count'];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>