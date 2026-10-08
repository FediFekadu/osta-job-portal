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
    
    if (!$input || !isset($input['action']) || !isset($input['profile_ids']) || !is_array($input['profile_ids'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request data']);
        exit;
    }
    
    $pdo = getDBConnection();
    $action = $input['action'];
    $profileIds = $input['profile_ids'];
    
    if (empty($profileIds)) {
        http_response_code(400);
        echo json_encode(['error' => 'No profiles selected']);
        exit;
    }
    
    $placeholders = str_repeat('?,', count($profileIds) - 1) . '?';
    
    switch ($action) {
        case 'activate':
            $stmt = $pdo->prepare("UPDATE users SET status = 'active' WHERE id IN ($placeholders)");
            break;
        case 'deactivate':
            $stmt = $pdo->prepare("UPDATE users SET status = 'inactive' WHERE id IN ($placeholders)");
            break;
        case 'verify':
            $stmt = $pdo->prepare("UPDATE users SET verified = 1 WHERE id IN ($placeholders)");
            break;
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action']);
            exit;
    }
    
    if ($stmt->execute($profileIds)) {
        $affected = $stmt->rowCount();
        echo json_encode([
            'success' => true,
            'message' => "Successfully updated $affected profiles"
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update profiles']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
