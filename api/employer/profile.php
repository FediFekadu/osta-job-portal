<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';
require_once '../../includes/auth.php';

header('Content-Type: application/json');

// Check if user is employer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'employer') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // Get employer profile
        $user_id = $_SESSION['user_id'];
        
        $stmt = $pdo->prepare("
            SELECT u.full_name, u.email, u.phone, 
                   COALESCE(ep.company_name, u.full_name) as company_name, 
                   ep.contact_person, ep.address, 
                   ep.website, ep.company_size, ep.industry, ep.description
            FROM users u
            LEFT JOIN employer_profiles ep ON u.id = ep.user_id
            WHERE u.id = ?
        ");
        
        $stmt->execute([$user_id]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($profile) {
            // Ensure all fields have default values
            $profile = array_merge([
                'company_name' => '',
                'contact_person' => '',
                'email' => '',
                'phone' => '',
                'address' => '',
                'website' => '',
                'company_size' => '',
                'industry' => '',
                'description' => ''
            ], $profile);
            
            echo json_encode([
                'success' => true,
                'profile' => $profile
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Profile not found']);
        }
        
    } elseif ($method === 'PUT') {
        // Update employer profile
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid input data']);
            exit;
        }
        
        $user_id = $_SESSION['user_id'];
        
        // Validate required fields
        if (empty($input['email']) || empty($input['company_name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Email and company name are required']);
            exit;
        }
        
        // Check if email is already used by another user
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$input['email'], $user_id]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            exit;
        }
        
        // Update users table
        $stmt = $pdo->prepare("
            UPDATE users 
            SET full_name = ?, email = ?, phone = ?, updated_at = NOW() 
            WHERE id = ?
        ");
        
        $stmt->execute([
            $input['company_name'],
            $input['email'],
            $input['phone'] ?? null,
            $user_id
        ]);
        
        // Update or insert employer profile
        $stmt = $pdo->prepare("
            INSERT INTO employer_profiles 
            (user_id, company_name, contact_person, address, website, company_size, industry, description, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
            company_name = VALUES(company_name),
            contact_person = VALUES(contact_person),
            address = VALUES(address),
            website = VALUES(website),
            company_size = VALUES(company_size),
            industry = VALUES(industry),
            description = VALUES(description),
            updated_at = NOW()
        ");
                $input['address'] ?? ''
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
