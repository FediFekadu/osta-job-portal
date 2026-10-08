<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and check admin authentication
session_start();

// Enhanced debugging for authentication issues
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'message' => 'Not authenticated. Please log in.',
        'debug' => 'Session user_id not set'
    ]);
    exit();
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false, 
        'message' => 'Access denied. Admin privileges required.',
        'debug' => 'User role: ' . ($_SESSION['role'] ?? 'not set')
    ]);
    exit();
}

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get jobs with filtering and better error handling
            try {
                $status = $_GET['status'] ?? '';
                $department = $_GET['department'] ?? '';
                $search = $_GET['search'] ?? '';
                $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
                $offset = max(0, (int)($_GET['offset'] ?? 0));
                
                $whereConditions = [];
                $params = [];
                
                if (!empty($status)) {
                    $whereConditions[] = "j.status = ?";
                    $params[] = $status;
                }
                
                if (!empty($department)) {
                    $whereConditions[] = "j.department_id = ?";
                    $params[] = $department;
                }
                
                if (!empty($search)) {
                    $whereConditions[] = "(j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)";
                    $searchTerm = "%{$search}%";
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                    $params[] = $searchTerm;
                }
                
                $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                $sql = "
                    SELECT 
                        j.id,
                        j.title,
                        j.description,
                        j.requirements,
                        j.salary_range,
                        j.location,
                        j.type,
                        j.status,
                        j.created_at,
                        j.updated_at,
                        d.name as department_name,
                        COUNT(ja.id) as application_count,
                        u.full_name as employer_name
                    FROM jobs j
                    LEFT JOIN departments d ON j.department_id = d.id
                    LEFT JOIN job_applications ja ON j.id = ja.job_id
                    LEFT JOIN users u ON j.employer_id = u.id
                    {$whereClause}
                    GROUP BY j.id
                    ORDER BY j.created_at DESC 
                    LIMIT ? OFFSET ?
                ";
                
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get total count for pagination
                $countSql = "
                    SELECT COUNT(DISTINCT j.id) as total
                    FROM jobs j
                    LEFT JOIN departments d ON j.department_id = d.id
                    {$whereClause}
                ";
                
                $countParams = array_slice($params, 0, -2); // Remove limit and offset
                $countStmt = $pdo->prepare($countSql);
                $countStmt->execute($countParams);
                $totalCount = $countStmt->fetch()['total'];
                
                // Ensure we always return an array
                if (!is_array($jobs)) {
                    $jobs = [];
                }
                
                // Get statistics
                $statsStmt = $pdo->prepare("
                    SELECT 
                        COUNT(*) as total_jobs,
                        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_jobs,
                        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_jobs,
                        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs,
                        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_jobs
                    FROM jobs
                ");
                $statsStmt->execute();
                $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => $jobs,
                    'pagination' => [
                        'total' => (int)$totalCount,
                        'limit' => $limit,
                        'offset' => $offset,
                        'count' => count($jobs)
                    ],
                    'stats' => $stats
                ]);
            } catch (PDOException $e) {
                throw new Exception('Database query failed: ' . $e->getMessage());
            }
            break;
            
        case 'PUT':
            // Update job status
            $jobId = $_GET['id'] ?? null;
            if (!$jobId) {
                throw new Exception('Job ID is required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON input');
            }
            
            if (!isset($input['status'])) {
                throw new Exception('Status is required');
            }
            
            $allowedStatuses = ['active', 'pending', 'closed', 'draft'];
            if (!in_array($input['status'], $allowedStatuses)) {
                throw new Exception('Invalid status. Allowed: ' . implode(', ', $allowedStatuses));
            }
            
            $stmt = $pdo->prepare("UPDATE jobs SET status = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$input['status'], $jobId]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Job not found or no changes made');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Job status updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete job (soft delete by setting status to 'deleted')
            $jobId = $_GET['id'] ?? null;
            if (!$jobId) {
                throw new Exception('Job ID is required');
            }
            
            // Check if job has applications
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM job_applications WHERE job_id = ?");
            $stmt->execute([$jobId]);
            $applicationCount = $stmt->fetch()['count'];
            
            if ($applicationCount > 0) {
                // Soft delete if there are applications
                $stmt = $pdo->prepare("UPDATE jobs SET status = 'closed', updated_at = NOW() WHERE id = ?");
                $stmt->execute([$jobId]);
                $message = 'Job marked as closed (has applications)';
            } else {
                // Hard delete if no applications
                $stmt = $pdo->prepare("DELETE FROM jobs WHERE id = ?");
                $stmt->execute([$jobId]);
                $message = 'Job deleted permanently';
            }
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Job not found');
            }
            
            echo json_encode([
                'success' => true,
                'message' => $message
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'file' => __FILE__,
            'line' => __LINE__,
            'session_id' => session_id(),
            'user_id' => $_SESSION['user_id'] ?? 'not set',
            'role' => $_SESSION['role'] ?? 'not set',
            'method' => $_SERVER['REQUEST_METHOD']
        ]
    ]);
}
?>
