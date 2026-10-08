<?php
require_once '../../includes/cors.php';


require_once '../../config/database.php';
require_once '../../includes/auth.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'employer') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get applications for employer's jobs
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;
        $status = $_GET['status'] ?? '';
        $job_id = $_GET['job_id'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        $query = "
            SELECT a.*, j.title as job_title, u.first_name, u.last_name, u.email, u.phone
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.user_id = u.id
            WHERE j.employer_id = ?
        ";
        $params = [$_SESSION['user_id']];
        
        if ($status) {
            $query .= " AND a.status = ?";
            $params[] = $status;
        }
        
        if ($job_id) {
            $query .= " AND j.id = ?";
            $params[] = $job_id;
        }
        
        $query .= " ORDER BY a.applied_at DESC LIMIT ? OFFSET ?";
        $params[] = (int)$limit;
        $params[] = (int)$offset;
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $applications = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $applications]);
        
    } elseif ($method === 'PUT') {
        // Update application status
        $input = json_decode(file_get_contents('php://input'), true);
        $application_id = $input['id'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$application_id || !$status) {
            echo json_encode(['success' => false, 'message' => 'Application ID and status required']);
            exit;
        }
        
        // Verify application belongs to employer's job
        $stmt = $pdo->prepare("
            SELECT a.id FROM applications a
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ? AND j.employer_id = ?
        ");
        $stmt->execute([$application_id, $_SESSION['user_id']]);
        
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Application not found']);
            exit;
        }
        
        // Update status
        $stmt = $pdo->prepare("UPDATE applications SET status = ? WHERE id = ?");
        $stmt->execute([$status, $application_id]);
        
        echo json_encode(['success' => true, 'message' => 'Application status updated']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>