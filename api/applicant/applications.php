<?php
require_once '../../includes/cors.php';


require_once '../../config/database.php';
require_once '../../includes/auth.php';

// Check if user is logged in and is an applicant
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'applicant') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get applicant's applications
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;
        $status = $_GET['status'] ?? '';
        $search = $_GET['search'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        $query = "
            SELECT a.*, j.title as job_title, j.location, j.employment_type, 
                   j.deadline, d.name as department_name, u.first_name as employer_first_name,
                   u.last_name as employer_last_name
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN departments d ON j.department_id = d.id
            JOIN users u ON j.employer_id = u.id
            WHERE a.user_id = ?
        ";
        $params = [$_SESSION['user_id']];
        
        if ($status) {
            $query .= " AND a.status = ?";
            $params[] = $status;
        }
        
        if ($search) {
            $query .= " AND (j.title LIKE ? OR d.name LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        $query .= " ORDER BY a.applied_at DESC LIMIT ? OFFSET ?";
        $params[] = (int)$limit;
        $params[] = (int)$offset;
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get total count
        $countQuery = "
            SELECT COUNT(*) 
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN departments d ON j.department_id = d.id
            WHERE a.user_id = ?
        ";
        $countParams = [$_SESSION['user_id']];
        
        if ($status) {
            $countQuery .= " AND a.status = ?";
            $countParams[] = $status;
        }
        
        if ($search) {
            $countQuery .= " AND (j.title LIKE ? OR d.name LIKE ?)";
            $countParams[] = "%$search%";
            $countParams[] = "%$search%";
        }
        
        $countStmt = $pdo->prepare($countQuery);
        $countStmt->execute($countParams);
        $total = $countStmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'data' => $applications,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => (int)$total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } elseif ($method === 'POST') {
        // Submit new application
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['job_id'])) {
            echo json_encode(['success' => false, 'message' => 'Job ID is required']);
            exit;
        }
        
        $job_id = $input['job_id'];
        
        // Check if job exists and is active
        $stmt = $pdo->prepare("SELECT * FROM jobs WHERE id = ? AND status = 'active' AND deadline >= CURDATE()");
        $stmt->execute([$job_id]);
        $job = $stmt->fetch();
        
        if (!$job) {
            echo json_encode(['success' => false, 'message' => 'Job not found or expired']);
            exit;
        }
        
        // Check if already applied
        $stmt = $pdo->prepare("SELECT id FROM applications WHERE job_id = ? AND user_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            echo json_encode(['success' => false, 'message' => 'You have already applied for this job']);
            exit;
        }
        
        // Create application
        $stmt = $pdo->prepare("
            INSERT INTO applications (job_id, user_id, cover_letter, resume_path, status, applied_at)
            VALUES (?, ?, ?, ?, 'pending', NOW())
        ");
        $stmt->execute([
            $job_id,
            $_SESSION['user_id'],
            $input['cover_letter'] ?? '',
            $input['resume_path'] ?? ''
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Application submitted successfully']);
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
