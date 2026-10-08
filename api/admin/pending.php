<?php
require_once '../../config/database.php';
require_once '../../includes/cors.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Session is already started by CORS include - no need to call session_start() again

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Get pending applications
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.job_id,
            j.title as job_title,
            u.full_name as applicant_name,
            u.email as applicant_email,
            a.status,
            a.created_at,
            'application' as type
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        JOIN users u ON a.user_id = u.id 
        WHERE a.status = 'pending'
        ORDER BY a.created_at DESC 
        LIMIT 20
    ");
    
    $stmt->execute();
    $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $pending
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
