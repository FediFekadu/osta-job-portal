<?php
require_once '../../includes/cors.php';


require_once '../../config/database.php';
require_once '../../includes/auth.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

try {
    $report_type = $_GET['type'] ?? 'overview';
    
    switch ($report_type) {
        case 'overview':
            // Get system overview statistics
            $stats = [];
            
            // Total users by role
            $stmt = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role");
            $user_stats = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            $stats['users'] = $user_stats;
            
            // Total jobs by status
            $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM jobs GROUP BY status");
            $job_stats = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            $stats['jobs'] = $job_stats;
            
            // Total applications by status
            $stmt = $pdo->query("SELECT status, COUNT(*) as count FROM applications GROUP BY status");
            $app_stats = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
            $stats['applications'] = $app_stats;
            
            // Recent activity (last 30 days)
            $stmt = $pdo->query("
                SELECT DATE(created_at) as date, COUNT(*) as count 
                FROM users 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
                GROUP BY DATE(created_at) 
                ORDER BY date DESC
            ");
            $stats['recent_registrations'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $stats]);
            break;
            
        case 'jobs':
            // Job statistics
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            
            $stmt = $pdo->prepare("
                SELECT j.*, d.name as department_name, u.full_name as employer_name,
                       (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
                FROM jobs j
                LEFT JOIN departments d ON j.department_id = d.id
                LEFT JOIN users u ON j.employer_id = u.id
                ORDER BY j.created_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([(int)$limit, (int)$offset]);
            $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $jobs]);
            break;
            
        case 'applications':
            // Application statistics
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            
            $stmt = $pdo->prepare("
                SELECT a.*, j.title as job_title, 
                       u1.full_name as applicant_name, u1.email as applicant_email,
                       u2.full_name as employer_name
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN users u1 ON a.user_id = u1.id
                JOIN users u2 ON j.employer_id = u2.id
                ORDER BY a.applied_at DESC
                LIMIT ? OFFSET ?
            ");
            $stmt->execute([(int)$limit, (int)$offset]);
            $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $applications]);
            break;
            
        default:
            echo json_encode(['success' => false, 'message' => 'Invalid report type']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
