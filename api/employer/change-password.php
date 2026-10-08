<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

// Check if user is employer
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'employer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['current_password']) || !isset($input['new_password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password and new password required']);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $current_password = $input['current_password'];
    $new_password = $input['new_password'];

    // Validate new password length
    if (strlen($new_password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'New password must be at least 6 characters long']);
        exit;
    }

    // Get current user data
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }

    // Verify current password
    if (!password_verify($current_password, $user['password'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Current password is incorrect']);
        exit;
    }

    // Update password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$hashed_password, $user_id]);

    echo json_encode([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
