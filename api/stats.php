<?php
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    // Get total jobs
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM jobs");
    $stmt->execute();
    $total_jobs = $stmt->fetchColumn() ?: 0;

    // Get total departments
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM departments");
    $stmt->execute();
    $total_departments = $stmt->fetchColumn() ?: 0;

    // Get total users (as applications proxy)
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'applicant'");
    $stmt->execute();
    $total_applications = $stmt->fetchColumn() ?: 0;

    echo json_encode([
        'success' => true,
        'data' => [
            'total_jobs' => (int)$total_jobs,
            'total_departments' => (int)$total_departments,
            'total_applications' => (int)$total_applications
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching statistics',
        'error' => $e->getMessage()
    ]);
}
?>
