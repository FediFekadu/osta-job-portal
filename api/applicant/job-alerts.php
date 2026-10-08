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
        // Get job alerts
        $stmt = $pdo->prepare("
            SELECT ja.*, d.name as department_name
            FROM job_alerts ja
            LEFT JOIN departments d ON ja.department_id = d.id
            WHERE ja.user_id = ?
            ORDER BY ja.created_at DESC
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $alerts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'data' => $alerts]);
        
    } elseif ($method === 'POST') {
        // Create job alert
        $input = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("
            INSERT INTO job_alerts (user_id, keywords, location, job_type, department_id, frequency, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 1, NOW())
        ");
        $stmt->execute([
            $_SESSION['user_id'],
            $input['keywords'] ?? '',
            $input['location'] ?? '',
            $input['job_type'] ?? '',
            $input['department_id'] ?? null,
            $input['frequency'] ?? 'weekly'
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Job alert created successfully']);
        
    } elseif ($method === 'PUT') {
        // Update job alert
        $input = json_decode(file_get_contents('php://input'), true);
        $alert_id = $input['id'] ?? null;
        
        if (!$alert_id) {
            echo json_encode(['success' => false, 'message' => 'Alert ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("
            UPDATE job_alerts 
            SET keywords = ?, location = ?, job_type = ?, department_id = ?, frequency = ?, is_active = ?
            WHERE id = ? AND user_id = ?
        ");
        $stmt->execute([
            $input['keywords'] ?? '',
            $input['location'] ?? '',
            $input['job_type'] ?? '',
            $input['department_id'] ?? null,
            $input['frequency'] ?? 'weekly',
            $input['is_active'] ?? 1,
            $alert_id,
            $_SESSION['user_id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Job alert updated successfully']);
        
    } elseif ($method === 'DELETE') {
        // Delete job alert
        $alert_id = $_GET['id'] ?? null;
        
        if (!$alert_id) {
            echo json_encode(['success' => false, 'message' => 'Alert ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM job_alerts WHERE id = ? AND user_id = ?");
        $stmt->execute([$alert_id, $_SESSION['user_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Job alert deleted successfully']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>