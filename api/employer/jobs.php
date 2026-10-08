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
        // Check if getting single job
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare("
                SELECT j.*, d.name as department_name
                FROM jobs j
                LEFT JOIN departments d ON j.department_id = d.id
                WHERE j.id = ? AND j.employer_id = ?
            ");
            $stmt->execute([$_GET['id'], $_SESSION['user_id']]);
            $job = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$job) {
                echo json_encode(['success' => false, 'message' => 'Job not found']);
                exit;
            }
            
            echo json_encode(['success' => true, 'data' => $job]);
            exit;
        }
        
        // Get all jobs for employer
        $page = $_GET['page'] ?? 1;
        $limit = $_GET['limit'] ?? 10;
        $offset = ($page - 1) * $limit;
        
        $stmt = $pdo->prepare("
            SELECT j.*, d.name as department_name,
                   (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
            FROM jobs j
            LEFT JOIN departments d ON j.department_id = d.id
            WHERE j.employer_id = ?
            ORDER BY j.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$_SESSION['user_id'], (int)$limit, (int)$offset]);
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $jobs]);
        
    } elseif ($method === 'POST') {
        // Create new job
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO jobs (title, description, requirements, location, employment_type, 
                            salary_range, deadline, department_id, employer_id, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
        ");
        $stmt->execute([
            $input['title'],
            $input['description'],
            $input['requirements'],
            $input['location'],
            $input['employment_type'],
            $input['salary_range'] ?? null,
            $input['deadline'],
            $input['department_id'],
            $_SESSION['user_id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Job created successfully']);
        
    } elseif ($method === 'PUT') {
        // Update job
        $input = json_decode(file_get_contents('php://input'), true);
        $job_id = $_GET['id'] ?? $input['id'] ?? null;
        
        if (!$job_id) {
            echo json_encode(['success' => false, 'message' => 'Job ID required']);
            exit;
        }
        
        // Verify job belongs to employer
        $stmt = $pdo->prepare("SELECT id FROM jobs WHERE id = ? AND employer_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Job not found']);
            exit;
        }
        
        // Update job
        $stmt = $pdo->prepare("
            UPDATE jobs 
            SET title = ?, description = ?, requirements = ?, location = ?, 
                employment_type = ?, salary_range = ?, deadline = ?, department_id = ?
            WHERE id = ? AND employer_id = ?
        ");
        $stmt->execute([
            $input['title'],
            $input['description'],
            $input['requirements'],
            $input['location'],
            $input['employment_type'],
            $input['salary_range'] ?? null,
            $input['deadline'],
            $input['department_id'],
            $job_id,
            $_SESSION['user_id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Job updated successfully']);
        
    } elseif ($method === 'DELETE') {
        // Delete job
        $job_id = $_GET['id'] ?? null;
        
        if (!$job_id) {
            echo json_encode(['success' => false, 'message' => 'Job ID required']);
            exit;
        }
        
        // Verify job belongs to employer
        $stmt = $pdo->prepare("SELECT id FROM jobs WHERE id = ? AND employer_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        if (!$stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Job not found']);
            exit;
        }
        
        // Delete job (set status to inactive instead of hard delete)
        $stmt = $pdo->prepare("UPDATE jobs SET status = 'inactive' WHERE id = ? AND employer_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Job deleted successfully']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>