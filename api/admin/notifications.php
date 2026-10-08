<?php
require_once '../../includes/cors.php';
require_once '../../config/database.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Start session and check admin authentication
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
    exit();
}

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get notifications with filtering
            $type = $_GET['type'] ?? '';
            $status = $_GET['status'] ?? '';
            $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
            $offset = max(0, (int)($_GET['offset'] ?? 0));
            
            $whereConditions = [];
            $params = [];
            
            if (!empty($type)) {
                $whereConditions[] = "type = ?";
                $params[] = $type;
            }
            
            if (!empty($status)) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Get notifications
            $stmt = $pdo->prepare("
                SELECT id, title, message, type, status, priority, recipient_type, 
                       created_at, updated_at, sent_at, read_at
                FROM notifications 
                $whereClause
                ORDER BY created_at DESC 
                LIMIT $limit OFFSET $offset
            ");
            $stmt->execute($params);
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get total count
            $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM notifications $whereClause");
            $countStmt->execute($params);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get statistics
            $statsStmt = $pdo->prepare("
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
                    SUM(CASE WHEN read_at IS NOT NULL THEN 1 ELSE 0 END) as read_count,
                    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority
                FROM notifications
            ");
            $statsStmt->execute();
            $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'data' => $notifications,
                'pagination' => [
                    'total' => (int)$total,
                    'limit' => $limit,
                    'offset' => $offset
                ],
                'stats' => $stats
            ]);
            break;
            
        case 'POST':
            // Create new notification
            $input = json_decode(file_get_contents('php://input'), true);
            
            $title = $input['title'] ?? '';
            $message = $input['message'] ?? '';
            $type = $input['type'] ?? 'general';
            $priority = $input['priority'] ?? 'medium';
            $recipientType = $input['recipient_type'] ?? 'all';
            $status = $input['status'] ?? 'draft';
            
            if (empty($title) || empty($message)) {
                throw new Exception('Title and message are required');
            }
            
            $validTypes = ['general', 'system', 'job', 'application', 'user'];
            $validPriorities = ['low', 'medium', 'high', 'urgent'];
            $validRecipientTypes = ['all', 'applicants', 'employers', 'admins'];
            $validStatuses = ['draft', 'pending', 'sent'];
            
            if (!in_array($type, $validTypes)) {
                throw new Exception('Invalid notification type');
            }
            
            if (!in_array($priority, $validPriorities)) {
                throw new Exception('Invalid priority level');
            }
            
            if (!in_array($recipientType, $validRecipientTypes)) {
                throw new Exception('Invalid recipient type');
            }
            
            if (!in_array($status, $validStatuses)) {
                throw new Exception('Invalid status');
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO notifications (title, message, type, priority, recipient_type, status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");
            $stmt->execute([$title, $message, $type, $priority, $recipientType, $status]);
            
            $notificationId = $pdo->lastInsertId();
            
            // If status is 'sent', update sent_at
            if ($status === 'sent') {
                $updateStmt = $pdo->prepare("UPDATE notifications SET sent_at = NOW() WHERE id = ?");
                $updateStmt->execute([$notificationId]);
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification created successfully',
                'notification_id' => $notificationId
            ]);
            break;
            
        case 'PUT':
            // Update notification
            $notificationId = $_GET['id'] ?? null;
            if (!$notificationId) {
                throw new Exception('Notification ID is required');
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $updateFields = [];
            $params = [];
            
            if (isset($input['title'])) {
                $updateFields[] = "title = ?";
                $params[] = $input['title'];
            }
            
            if (isset($input['message'])) {
                $updateFields[] = "message = ?";
                $params[] = $input['message'];
            }
            
            if (isset($input['status'])) {
                $updateFields[] = "status = ?";
                $params[] = $input['status'];
                
                // Update sent_at if status is changed to 'sent'
                if ($input['status'] === 'sent') {
                    $updateFields[] = "sent_at = NOW()";
                }
            }
            
            if (isset($input['priority'])) {
                $updateFields[] = "priority = ?";
                $params[] = $input['priority'];
            }
            
            if (isset($input['read']) && $input['read']) {
                $updateFields[] = "read_at = NOW()";
            }
            
            if (empty($updateFields)) {
                throw new Exception('No valid fields to update');
            }
            
            $updateFields[] = "updated_at = NOW()";
            $params[] = $notificationId;
            
            $sql = "UPDATE notifications SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete notification
            $notificationId = $_GET['id'] ?? null;
            if (!$notificationId) {
                throw new Exception('Notification ID is required');
            }
            
            $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
            $stmt->execute([$notificationId]);
            
            if ($stmt->rowCount() === 0) {
                throw new Exception('Notification not found');
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification deleted successfully'
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
        'message' => $e->getMessage()
    ]);
}
?>
