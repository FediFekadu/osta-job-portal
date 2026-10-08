<?php
require_once '../../includes/cors.php';
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../../config/database.php';

try {
    $job_id = $_GET['id'] ?? null;
    
    if (!$job_id) {
        echo json_encode(['success' => false, 'message' => 'Job ID is required']);
        exit;
    }
    
    $query = "SELECT j.*, d.name as department_name, 
                     u.first_name, u.last_name, u.email as employer_email
              FROM jobs j 
              LEFT JOIN departments d ON j.department_id = d.id 
              LEFT JOIN users u ON j.employer_id = u.id
              WHERE j.id = ? AND j.status = 'active'";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$job_id]);
    $job = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$job) {
        echo json_encode(['success' => false, 'message' => 'Job not found']);
        exit;
    }
    
    echo json_encode(['success' => true, 'data' => $job]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
