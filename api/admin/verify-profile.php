<?php
require_once '../../config/database.php';
require_once '../../includes/cors.php';

handleCORS();

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['profile_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Profile ID required']);
        exit;
    }
    
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("UPDATE users SET verified = 1 WHERE id = ?");
    if ($stmt->execute([$input['profile_id']])) {
        echo json_encode([
            'success' => true,
            'message' => 'Profile verified successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to verify profile']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
