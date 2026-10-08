<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and check admin authentication
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
    exit();
}

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    
    // Get date range parameters
    $startDate = $_GET['start_date'] ?? date('Y-m-01'); // First day of current month
    $endDate = $_GET['end_date'] ?? date('Y-m-d'); // Today
    
    // Validate dates
    if (!strtotime($startDate) || !strtotime($endDate)) {
        throw new Exception('Invalid date format');
    }
    
    // User Statistics
    $userStats = $pdo->prepare("
        SELECT 
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'applicant' THEN 1 ELSE 0 END) as applicants,
            SUM(CASE WHEN role = 'employer' THEN 1 ELSE 0 END) as employers,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
            SUM(CASE WHEN DATE(created_at) BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_users
        FROM users
    ");
    $userStats->execute([$startDate, $endDate]);
    $userStatsData = $userStats->fetch(PDO::FETCH_ASSOC);
    
    // Job Statistics
    $jobStats = $pdo->prepare("
        SELECT 
            COUNT(*) as total_jobs,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_jobs,
            SUM(CASE WHEN DATE(created_at) BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_jobs
        FROM jobs
    ");
    $jobStats->execute([$startDate, $endDate]);
    $jobStatsData = $jobStats->fetch(PDO::FETCH_ASSOC);
    
    // Application Statistics
    $applicationStats = $pdo->prepare("
        SELECT 
            COUNT(*) as total_applications,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
            SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications,
            SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications,
            SUM(CASE WHEN DATE(created_at) BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_applications
        FROM job_applications
    ");
    $applicationStats->execute([$startDate, $endDate]);
    $applicationStatsData = $applicationStats->fetch(PDO::FETCH_ASSOC);
    
    // Department Statistics
    $departmentStats = $pdo->prepare("
        SELECT 
            d.name as department_name,
            COUNT(j.id) as job_count,
            COUNT(DISTINCT ja.id) as application_count
        FROM departments d
        LEFT JOIN jobs j ON d.id = j.department_id
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        GROUP BY d.id, d.name
        ORDER BY job_count DESC
        LIMIT 10
    ");
    $departmentStats->execute();
    $departmentStatsData = $departmentStats->fetchAll(PDO::FETCH_ASSOC);
    
    // Recent Activity (last 30 days)
    $recentActivity = $pdo->prepare("
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            'users' as type
        FROM users 
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        
        UNION ALL
        
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            'jobs' as type
        FROM jobs 
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        
        UNION ALL
        
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as count,
            'applications' as type
        FROM job_applications 
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        
        ORDER BY date DESC
    ");
    $recentActivity->execute();
    $recentActivityData = $recentActivity->fetchAll(PDO::FETCH_ASSOC);
    
    // Top Performing Jobs
    $topJobs = $pdo->prepare("
        SELECT 
            j.title,
            j.department_id,
            d.name as department_name,
            COUNT(ja.id) as application_count,
            j.created_at
        FROM jobs j
        LEFT JOIN job_applications ja ON j.id = ja.job_id
        LEFT JOIN departments d ON j.department_id = d.id
        WHERE j.status = 'active'
        GROUP BY j.id
        ORDER BY application_count DESC
        LIMIT 10
    ");
    $topJobs->execute();
    $topJobsData = $topJobs->fetchAll(PDO::FETCH_ASSOC);
    
    // Monthly Growth Data
    $monthlyGrowth = $pdo->prepare("
        SELECT 
            DATE_FORMAT(created_at, '%Y-%m') as month,
            COUNT(*) as user_count
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month ASC
    ");
    $monthlyGrowth->execute();
    $monthlyGrowthData = $monthlyGrowth->fetchAll(PDO::FETCH_ASSOC);
    
    // Response data
    $analyticsData = [
        'success' => true,
        'data' => [
            'date_range' => [
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'user_stats' => $userStatsData,
            'job_stats' => $jobStatsData,
            'application_stats' => $applicationStatsData,
            'department_stats' => $departmentStatsData,
            'recent_activity' => $recentActivityData,
            'top_jobs' => $topJobsData,
            'monthly_growth' => $monthlyGrowthData,
            'summary' => [
                'total_users' => (int)$userStatsData['total_users'],
                'total_jobs' => (int)$jobStatsData['total_jobs'],
                'total_applications' => (int)$applicationStatsData['total_applications'],
                'active_jobs' => (int)$jobStatsData['active_jobs'],
                'pending_applications' => (int)$applicationStatsData['pending_applications']
            ]
        ]
    ];
    
    echo json_encode($analyticsData);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
