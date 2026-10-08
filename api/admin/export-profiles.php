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
    $format = $_GET['format'] ?? 'csv';
    
    // Get all user profiles
    $stmt = $pdo->prepare("
        SELECT id, username, email, full_name, role, status, created_at, last_login, verified
        FROM users 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($format === 'csv') {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="user_profiles.csv"');
        
        $output = fopen('php://output', 'w');
        
        // CSV headers
        fputcsv($output, ['ID', 'Username', 'Email', 'Full Name', 'Role', 'Status', 'Created At', 'Last Login', 'Verified']);
        
        // CSV data
        foreach ($profiles as $profile) {
            fputcsv($output, [
                $profile['id'],
                $profile['username'],
                $profile['email'],
                $profile['full_name'],
                $profile['role'],
                $profile['status'],
                $profile['created_at'],
                $profile['last_login'],
                $profile['verified'] ? 'Yes' : 'No'
            ]);
        }
        
        fclose($output);
    } else {
        // JSON format
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $profiles
        ]);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>
