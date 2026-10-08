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

// Require applicant role
require_role('applicant');
set_security_headers();

try {
    $user_id = $_SESSION['user_id'];
    
    // Get applicant statistics
    $stats = [];
    
    // Total applications
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM applications WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $stats['totalApplications'] = $stmt->fetch()['count'];
    
    // Pending applications
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = 'pending'");
    $stmt->execute([$user_id]);
    $stats['pendingApplications'] = $stmt->fetch()['count'];
    
    // Interview invitations
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = 'interview'");
    $stmt->execute([$user_id]);
    $stats['interviewInvitations'] = $stmt->fetch()['count'];
    
    // Successful applications
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM applications WHERE user_id = ? AND status = 'hired'");
    $stmt->execute([$user_id]);
    $stats['successfulApplications'] = $stmt->fetch()['count'];
    
    // Saved jobs
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM saved_jobs WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $stats['savedJobs'] = $stmt->fetch()['count'];
    
    // Job alerts
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM job_alerts WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $stats['jobAlerts'] = $stmt->fetch()['count'];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    error_log("Applicant stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}
?>