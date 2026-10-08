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
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    
    // Get recent user activity (registrations, applications, etc.)
    $stmt = $pdo->prepare("
        SELECT 
            u.full_name,
            u.email,
            u.created_at as activity_date,
            'registration' as activity_type,
            'User registered' as activity_description
        FROM users u 
        WHERE u.role = 'applicant'
        ORDER BY u.created_at DESC 
        LIMIT ?
    ");
    
    $stmt->execute([$limit]);
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $activities
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch activity data',
        'debug' => $e->getMessage()
    ]);
}
?>
