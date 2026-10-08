<?php
require_once '../../includes/cors.php';


require_once '../../config/database.php';
require_once '../../includes/auth.php';

// Check if user is logged in and is an applicant
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'applicant') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get applicant profile
        $stmt = $pdo->prepare("
            SELECT u.*, ap.* 
            FROM users u 
            LEFT JOIN applicant_profiles ap ON u.id = ap.user_id 
            WHERE u.id = ?
        ");
        $stmt->execute([$_SESSION['user_id']]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$profile) {
            echo json_encode(['success' => false, 'message' => 'Profile not found']);
            exit;
        }
        
        // Remove sensitive data
        unset($profile['password']);
        
        echo json_encode(['success' => true, 'data' => $profile]);
        
    } elseif ($method === 'PUT' || $method === 'POST') {
        // Update applicant profile
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            echo json_encode(['success' => false, 'message' => 'Invalid input']);
            exit;
        }
        
        // Update users table
        $stmt = $pdo->prepare("
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, phone = ? 
            WHERE id = ?
        ");
        $stmt->execute([
            $input['first_name'] ?? '',
            $input['last_name'] ?? '',
            $input['email'] ?? '',
            $input['phone'] ?? '',
            $_SESSION['user_id']
        ]);
        
        // Check if applicant profile exists
        $stmt = $pdo->prepare("SELECT id FROM applicant_profiles WHERE user_id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $exists = $stmt->fetch();
        
        if ($exists) {
            // Update existing profile
            $stmt = $pdo->prepare("
                UPDATE applicant_profiles 
                SET education = ?, experience = ?, skills = ?, resume_path = ?, 
                    cover_letter = ?, linkedin_url = ?, portfolio_url = ?
                WHERE user_id = ?
            ");
            $stmt->execute([
                $input['education'] ?? '',
                $input['experience'] ?? '',
                $input['skills'] ?? '',
                $input['resume_path'] ?? '',
                $input['cover_letter'] ?? '',
                $input['linkedin_url'] ?? '',
                $input['portfolio_url'] ?? '',
                $_SESSION['user_id']
            ]);
        } else {
            // Create new profile
            $stmt = $pdo->prepare("
                INSERT INTO applicant_profiles 
                (user_id, education, experience, skills, resume_path, cover_letter, linkedin_url, portfolio_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $_SESSION['user_id'],
                $input['education'] ?? '',
                $input['experience'] ?? '',
                $input['skills'] ?? '',
                $input['resume_path'] ?? '',
                $input['cover_letter'] ?? '',
                $input['linkedin_url'] ?? '',
                $input['portfolio_url'] ?? ''
            ]);
        }
        
        echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
