<?php
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../config/database.php';

try {
    // First check if status column exists
    $stmt = $pdo->query("DESCRIBE departments");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('status', $columns)) {
        // Use status column if it exists
        $stmt = $pdo->query("SELECT id, name FROM departments WHERE status = 'active' ORDER BY name");
    } else {
        // Fallback: get all departments if no status column
        $stmt = $pdo->query("SELECT id, name FROM departments ORDER BY name");
    }
    
    $departments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $departments]);
    
} catch (Exception $e) {
    // Return actual error for debugging
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Server error',
        'debug' => $e->getMessage() // Add debug info
    ]);
}
?>
