<?php
require_once '../../config/database.php';
require_once '../../includes/cors.php';

// Handle CORS
handleCORS();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

session_start();

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Get recent activity data
    $stmt = $pdo->prepare("
        SELECT 
            'application' as type,
            CONCAT('New application for job: ', j.title) as description,
            a.created_at as timestamp,
            u.full_name as user_name
        FROM applications a 
        JOIN jobs j ON a.job_id = j.id 
        JOIN users u ON a.user_id = u.id 
        WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
            'user' as type,
            CONCAT('New user registered: ', full_name) as description,
            created_at as timestamp,
            full_name as user_name
        FROM users 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND role = 'applicant'
        
        ORDER BY timestamp DESC 
        LIMIT 10
    ");
    
    $stmt->execute();
    $activities = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format timestamps
    foreach ($activities as &$activity) {
        $activity['timestamp'] = date('Y-m-d H:i:s', strtotime($activity['timestamp']));
        $activity['time_ago'] = timeAgo($activity['timestamp']);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $activities
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}

function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'just now';
    if ($time < 3600) return floor($time/60) . 'm ago';
    if ($time < 86400) return floor($time/3600) . 'h ago';
    if ($time < 2592000) return floor($time/86400) . 'd ago';
    return date('M j, Y', strtotime($datetime));
}
?>
