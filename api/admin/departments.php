<?php
session_start();
require_once '../../config/database.php';
require_once '../../includes/auth.php';
require_once '../../includes/security.php';
require_once '../../includes/cors.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_role('admin');
set_security_headers();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get all departments
            $search = isset($_GET['search']) ? sanitize($_GET['search']) : '';
            
            $query = "SELECT id, name, description, created_at FROM departments";
            $params = [];
            
            if (!empty($search)) {
                $query .= " WHERE name LIKE ? OR description LIKE ?";
                $search_term = "%$search%";
                $params = [$search_term, $search_term];
            }
            
            $query .= " ORDER BY name";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $departments = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $departments
            ]);
            break;
            
        case 'POST':
            // Create department
            $input = json_decode(file_get_contents('php://input'), true);
            
            $name = sanitize($input['name'] ?? '');
            $description = sanitize($input['description'] ?? '');
            
            if (empty($name)) {
                throw new Exception('Department name is required');
            }
            
            // Check if department exists
            $check_stmt = $pdo->prepare("SELECT id FROM departments WHERE name = ?");
            $check_stmt->execute([$name]);
            if ($check_stmt->fetch()) {
                throw new Exception('Department already exists');
            }
            
            $stmt = $pdo->prepare("INSERT INTO departments (name, description, created_at) VALUES (?, ?, NOW())");
            $stmt->execute([$name, $description]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Department created successfully',
                'department_id' => $pdo->lastInsertId()
            ]);
            break;
            
        case 'PUT':
            // Update department
            $input = json_decode(file_get_contents('php://input'), true);
            $dept_id = (int)($input['id'] ?? 0);
            
            if (!$dept_id) {
                throw new Exception('Department ID is required');
            }
            
            $name = sanitize($input['name'] ?? '');
            $description = sanitize($input['description'] ?? '');
            
            if (empty($name)) {
                throw new Exception('Department name is required');
            }
            
            $stmt = $pdo->prepare("UPDATE departments SET name = ?, description = ? WHERE id = ?");
            $stmt->execute([$name, $description, $dept_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Department updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete department
            $input = json_decode(file_get_contents('php://input'), true);
            $dept_id = (int)($input['id'] ?? 0);
            
            if (!$dept_id) {
                throw new Exception('Department ID is required');
            }
            
            // Check if department has jobs
            $check_stmt = $pdo->prepare("SELECT COUNT(*) as count FROM jobs WHERE department_id = ?");
            $check_stmt->execute([$dept_id]);
            $job_count = $check_stmt->fetch()['count'];
            
            if ($job_count > 0) {
                throw new Exception('Cannot delete department with existing jobs');
            }
            
            $stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
            $stmt->execute([$dept_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Department deleted successfully'
            ]);
            break;
            
        default:
            throw new Exception('Method not allowed');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>