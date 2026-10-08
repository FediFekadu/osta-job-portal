<?php
require_once '../../includes/cors.php';


require_once '../../config/database.php';
require_once '../../includes/auth.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'applicant') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get saved jobs
        $stmt = $pdo->prepare("
            SELECT sj.*, j.title, j.location, j.employment_type, j.deadline, 
                   d.name as department_name
            FROM saved_jobs sj
            JOIN jobs j ON sj.job_id = j.id
            JOIN departments d ON j.department_id = d.id
            WHERE sj.user_id = ?
            ORDER BY sj.saved_at DESC
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $saved_jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $saved_jobs]);
        
    } elseif ($method === 'POST') {
        // Save job
        $input = json_decode(file_get_contents('php://input'), true);
        $job_id = $input['job_id'] ?? null;
        
        if (!$job_id) {
            echo json_encode(['success' => false, 'message' => 'Job ID required']);
            exit;
        }
        
        // Check if already saved
        $stmt = $pdo->prepare("SELECT id FROM saved_jobs WHERE job_id = ? AND user_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Job already saved']);
            exit;
        }
        
        // Save job
        $stmt = $pdo->prepare("INSERT INTO saved_jobs (job_id, user_id, saved_at) VALUES (?, ?, NOW())");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Job saved successfully']);
        
    } elseif ($method === 'DELETE') {
        // Unsave job
        $job_id = $_GET['job_id'] ?? null;
        
        if (!$job_id) {
            echo json_encode(['success' => false, 'message' => 'Job ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM saved_jobs WHERE job_id = ? AND user_id = ?");
        $stmt->execute([$job_id, $_SESSION['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Job unsaved successfully']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>