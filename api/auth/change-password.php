<?php
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/cors.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $current_password = $input['current_password'] ?? '';
    $new_password = $input['new_password'] ?? '';
    $confirm_password = $input['confirm_password'] ?? '';
    
    // Validate required fields
    if (empty($current_password) || empty($new_password) || empty($confirm_password)) {
        throw new Exception('All fields are required');
    }
    
    // Validate password match
    if ($new_password !== $confirm_password) {
        throw new Exception('New passwords do not match');
    }
    
    // Validate password strength
    if (strlen($new_password) < 6) {
        throw new Exception('New password must be at least 6 characters long');
    }
    
    // Get current user data
    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        throw new Exception('User not found');
    }
    
    // Verify current password
    if (!password_verify($current_password, $user['password'])) {
        throw new Exception('Current password is incorrect');
    }
    
    // Hash new password
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Update password
    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashed_password, $_SESSION['user_id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
