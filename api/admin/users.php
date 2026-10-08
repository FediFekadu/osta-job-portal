<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and check admin authentication
session_start();

// Enhanced debugging for authentication issues
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'message' => 'Not authenticated. Please log in.',
        'debug' => 'Session user_id not set'
    ]);
    exit();
}

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false, 
        'message' => 'Access denied. Admin privileges required.',
        'debug' => 'User role: ' . ($_SESSION['role'] ?? 'not set')
    ]);
    exit();
}

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all users with better error handling
            try {
                $stmt = $pdo->prepare("
                    SELECT id, username, email, full_name, role, status, created_at, last_login 
                    FROM users 
                    ORDER BY created_at DESC
                ");
                $stmt->execute();
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Ensure we always return an array
                if (!is_array($users)) {
                    $users = [];
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => $users,
                    'count' => count($users)
                ]);
            } catch (PDOException $e) {
                throw new Exception('Database query failed: ' . $e->getMessage());
            }
            break;
            
        case 'PUT':
            // Update user
            $userId = $_GET['id'] ?? null;
            if (!$userId) {
                throw new Exception('User ID is required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception('Invalid JSON input');
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($input['status'])) {
                $updateFields[] = "status = ?";
                $params[] = $input['status'];
            }
            
            if (isset($input['role'])) {
                $updateFields[] = "role = ?";
                $params[] = $input['role'];
            }
            
            if (isset($input['full_name'])) {
                $updateFields[] = "full_name = ?";
                $params[] = $input['full_name'];
            }
            
            if (empty($updateFields)) {
                throw new Exception('No valid fields to update');
            }
            
            $params[] = $userId;
            $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'User updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete user
            $userId = $_GET['id'] ?? null;
            if (!$userId) {
                throw new Exception('User ID is required');
            }
            
            // Prevent admin from deleting themselves
            if ($userId == $_SESSION['user_id']) {
                throw new Exception('Cannot delete your own account');
            }
            
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role != 'admin'");
            $stmt->execute([$userId]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('User not found or cannot delete admin users');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'User deleted successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'debug' => [
            'file' => __FILE__,
            'line' => __LINE__,
            'session_id' => session_id(),
            'user_id' => $_SESSION['user_id'] ?? 'not set',
            'role' => $_SESSION['role'] ?? 'not set'
        ]
    ]);
}
?>
