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
        // Get user profiles with filtering
        $search = $_GET['search'] ?? '';
        $role = $_GET['role'] ?? 'all';
        $status = $_GET['status'] ?? 'all';
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(50, max(10, intval($_GET['limit'] ?? 10)));
        $offset = ($page - 1) * $limit;
        
        $whereConditions = [];
        $params = [];
        
        if (!empty($search)) {
            $whereConditions[] = "(full_name LIKE ? OR email LIKE ? OR username LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }
        
        if ($role !== 'all') {
            $whereConditions[] = "role = ?";
            $params[] = $role;
        }
        
        if ($status !== 'all') {
            $whereConditions[] = "status = ?";
            $params[] = $status;
        }
        
        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
        
        // Get total count
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM users $whereClause");
        $countStmt->execute($params);
        $total = $countStmt->fetchColumn();
        
        // Get profiles
        $stmt = $pdo->prepare("
            SELECT id, username, email, full_name, role, status, created_at, last_login, verified
            FROM users 
            $whereClause
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        ");
        
        $stmt->execute([...$params, $limit, $offset]);
        $profiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'data' => $profiles,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Update profile status
        $profileId = $_GET['id'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$profileId || !$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE users SET status = ? WHERE id = ?");
        if ($stmt->execute([$input['status'], $profileId])) {
            echo json_encode(['success' => true, 'message' => 'Profile updated']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Update failed']);
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
