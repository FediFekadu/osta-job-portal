<?php
require_once __DIR__ . '/../includes/cors.php';


require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    if (!isset($_FILES['file'])) {
        echo json_encode(['success' => false, 'message' => 'No file uploaded']);
        exit;
    }
    
    $file = $_FILES['file'];
    $upload_type = $_POST['type'] ?? 'resume'; // resume, cover_letter, profile_image
    
    // Validate file
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['success' => false, 'message' => 'Upload error']);
        exit;
    }
    
    // Check file size (5MB max)
    $max_size = 5 * 1024 * 1024;
    if ($file['size'] > $max_size) {
        echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 5MB']);
        exit;
    }
    
    // Get file extension
    $file_info = pathinfo($file['name']);
    $extension = strtolower($file_info['extension']);
    
    // Validate file types based on upload type
    $allowed_extensions = [];
    switch ($upload_type) {
        case 'resume':
        case 'cover_letter':
            $allowed_extensions = ['pdf', 'doc', 'docx'];
            break;
        case 'profile_image':
            $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
            break;
        default:
            $allowed_extensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    }
    
    if (!in_array($extension, $allowed_extensions)) {
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
        exit;
    }
    
    // Create upload directory if it doesn't exist
    $upload_dir = '../uploads/' . $upload_type . 's/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Generate unique filename
    $filename = $_SESSION['user_id'] . '_' . time() . '_' . uniqid() . '.' . $extension;
    $file_path = $upload_dir . $filename;
    
    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $file_path)) {
        // Store file info in database
        $stmt = $pdo->prepare("
            INSERT INTO file_uploads (user_id, original_name, filename, file_path, file_type, file_size, upload_type, uploaded_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([
            $_SESSION['user_id'],
            $file['name'],
            $filename,
            $file_path,
            $file['type'],
            $file['size'],
            $upload_type
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => [
                'filename' => $filename,
                'file_path' => $file_path,
                'original_name' => $file['name'],
                'file_size' => $file['size']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save file']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Server error']);
}
?>
