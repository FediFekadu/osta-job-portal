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

try {
    $pdo = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get admin profile
        $stmt = $pdo->prepare("SELECT id, username, email, full_name, created_at FROM users WHERE id = ? AND role = 'admin'");
        $stmt->execute([$_SESSION['user_id']]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found']);
            exit;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $profile
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update admin profile
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON data']);
            exit;
        }
        
        $allowedFields = ['username', 'email', 'full_name'];
        $updateFields = [];
        $updateValues = [];
        
        foreach ($allowedFields as $field) {
            if (isset($input[$field])) {
                $updateFields[] = "$field = ?";
                $updateValues[] = $input[$field];
            }
        }
        
        if (empty($updateFields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No valid fields to update']);
            exit;
        }
        
        $updateValues[] = $_SESSION['user_id'];
        
        $stmt = $pdo->prepare("UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ? AND role = 'admin'");
        
        if ($stmt->execute($updateValues)) {
            echo json_encode([
                'success' => true,
                'message' => 'Profile updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update profile']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
