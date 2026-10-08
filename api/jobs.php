<?php
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    // Check if this is a request for a single job
    $path = $_SERVER['REQUEST_URI'];
    $path_parts = explode('/', trim($path, '/'));
    
    // If URL is like /api/jobs/123, get single job
    if (count($path_parts) >= 3 && is_numeric($path_parts[2])) {
        $job_id = $path_parts[2];
        
        $query = "SELECT j.*, d.name as department_name 
                  FROM jobs j 
                  LEFT JOIN departments d ON j.department_id = d.id 
                  WHERE j.id = ?";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$job_id]);
        $job = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$job) {
            echo json_encode(['success' => false, 'message' => 'Job not found']);
            exit;
        }
        
        echo json_encode(['success' => true, 'data' => $job]);
        exit;
    } else {
        // Get all jobs with filters
        $search = $_GET['search'] ?? '';
        $department = $_GET['department'] ?? '';
        $job_type = $_GET['job_type'] ?? '';
        $location = $_GET['location'] ?? '';
        $featured = $_GET['featured'] ?? '';
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(50, max(1, (int)($_GET['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        
        // Check what columns exist in jobs table
        $stmt = $pdo->query("DESCRIBE jobs");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Build query based on available columns
        $query = "SELECT j.*, d.name as department_name 
                  FROM jobs j 
                  LEFT JOIN departments d ON j.department_id = d.id 
                  WHERE 1=1";
        $params = [];
        
        // Add status filter if column exists
        if (in_array('status', $columns)) {
            $query .= " AND j.status = 'active'";
        }
        
        // Add deadline filter if column exists
        if (in_array('deadline', $columns)) {
            $query .= " AND j.deadline >= CURDATE()";
        }
        
        // Add search filter
        if ($search) {
            $query .= " AND (j.title LIKE ? OR j.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        // Add department filter
        if ($department) {
            $query .= " AND j.department_id = ?";
            $params[] = $department;
        }
        
        // Add job type filter if column exists
        if ($job_type && in_array('job_type', $columns)) {
            $query .= " AND j.job_type = ?";
            $params[] = $job_type;
        }
        
        // Add location filter if column exists
        if ($location && in_array('location', $columns)) {
            $query .= " AND j.location LIKE ?";
            $params[] = "%$location%";
        }
        
        // Add featured filter if column exists
        if ($featured && in_array('featured', $columns)) {
            $query .= " AND j.featured = 1";
        }
        
        $query .= " ORDER BY j.created_at DESC LIMIT $limit OFFSET $offset";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count for pagination
        $countQuery = "SELECT COUNT(*) FROM jobs j WHERE 1=1";
        if (in_array('status', $columns)) {
            $countQuery .= " AND j.status = 'active'";
        }
        if (in_array('deadline', $columns)) {
            $countQuery .= " AND j.deadline >= CURDATE()";
        }
        
        $countStmt = $pdo->prepare($countQuery);
        $countStmt->execute();
        $total = $countStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'data' => $jobs,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error',
        'debug' => $e->getMessage()
    ]);
}
?>
