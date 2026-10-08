<?php
// Comprehensive API Diagnostic Script
// This script will test all backend APIs and identify issues

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>OSTA Job Portal - API Diagnostic Report</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; background: #e8f5e9; padding: 10px; margin: 5px 0; }
    .error { color: red; background: #ffebee; padding: 10px; margin: 5px 0; }
    .warning { color: orange; background: #fff3e0; padding: 10px; margin: 5px 0; }
    .info { color: blue; background: #e3f2fd; padding: 10px; margin: 5px 0; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
</style>";

// Test 1: Database Connection
echo "<h2>1. Database Connection Test</h2>";
try {
    require_once 'config/database.php';
    echo "<div class='success'>✓ Database connection successful</div>";
    
    // Test basic tables
    $tables = ['users', 'jobs', 'departments', 'applications'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetchColumn();
            echo "<div class='info'>✓ Table '$table': $count records</div>";
        } catch (Exception $e) {
            echo "<div class='error'>✗ Table '$table' error: " . $e->getMessage() . "</div>";
        }
    }
} catch (Exception $e) {
    echo "<div class='error'>✗ Database connection failed: " . $e->getMessage() . "</div>";
}

// Test 2: CORS Configuration
echo "<h2>2. CORS Configuration Test</h2>";
try {
    require_once 'includes/cors.php';
    echo "<div class='success'>✓ CORS configuration loaded</div>";
    
    // Check if CORS headers are being set
    $headers = headers_list();
    $corsHeaders = array_filter($headers, function($header) {
        return strpos($header, 'Access-Control') !== false;
    });
    
    if (!empty($corsHeaders)) {
        echo "<div class='success'>✓ CORS headers detected:</div>";
        foreach ($corsHeaders as $header) {
            echo "<div class='info'>  - $header</div>";
        }
    } else {
        echo "<div class='warning'>⚠ No CORS headers detected</div>";
    }
} catch (Exception $e) {
    echo "<div class='error'>✗ CORS configuration error: " . $e->getMessage() . "</div>";
}

// Test 3: Public API Endpoints
echo "<h2>3. Public API Endpoints Test</h2>";

$publicApis = [
    '/api/stats.php' => 'Statistics',
    '/api/departments.php' => 'Departments',
    '/api/jobs.php' => 'Jobs'
];

foreach ($publicApis as $endpoint => $name) {
    echo "<h3>Testing $name ($endpoint)</h3>";
    
    $fullPath = __DIR__ . $endpoint;
    if (file_exists($fullPath)) {
        echo "<div class='success'>✓ File exists</div>";
        
        // Capture output
        ob_start();
        try {
            include $fullPath;
            $output = ob_get_clean();
            
            // Try to decode JSON
            $data = json_decode($output, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                echo "<div class='success'>✓ Valid JSON response</div>";
                echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
            } else {
                echo "<div class='error'>✗ Invalid JSON response</div>";
                echo "<pre>Raw output: " . htmlspecialchars($output) . "</pre>";
            }
        } catch (Exception $e) {
            ob_end_clean();
            echo "<div class='error'>✗ Execution error: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='error'>✗ File not found: $fullPath</div>";
    }
}

// Test 4: Session and Authentication
echo "<h2>4. Session and Authentication Test</h2>";
session_start();
echo "<div class='info'>Session ID: " . session_id() . "</div>";
echo "<div class='info'>Session Status: " . (session_status() === PHP_SESSION_ACTIVE ? 'Active' : 'Inactive') . "</div>";

if (isset($_SESSION['user_id'])) {
    echo "<div class='success'>✓ User logged in: ID " . $_SESSION['user_id'] . ", Role: " . ($_SESSION['role'] ?? 'Unknown') . "</div>";
} else {
    echo "<div class='warning'>⚠ No user session found</div>";
}

// Test 5: Admin API Endpoints (if logged in as admin)
if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
    echo "<h2>5. Admin API Endpoints Test</h2>";
    
    $adminApis = [
        '/api/admin/dashboard.php' => 'Admin Dashboard',
        '/api/admin/users.php' => 'User Management',
        '/api/admin/departments.php' => 'Department Management'
    ];
    
    foreach ($adminApis as $endpoint => $name) {
        echo "<h3>Testing $name ($endpoint)</h3>";
        
        $fullPath = __DIR__ . $endpoint;
        if (file_exists($fullPath)) {
            echo "<div class='success'>✓ File exists</div>";
            
            // Test with GET request simulation
            $_SERVER['REQUEST_METHOD'] = 'GET';
            
            ob_start();
            try {
                include $fullPath;
                $output = ob_get_clean();
                
                $data = json_decode($output, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    echo "<div class='success'>✓ Valid JSON response</div>";
                    echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
                } else {
                    echo "<div class='error'>✗ Invalid JSON response</div>";
                    echo "<pre>Raw output: " . htmlspecialchars($output) . "</pre>";
                }
            } catch (Exception $e) {
                ob_end_clean();
                echo "<div class='error'>✗ Execution error: " . $e->getMessage() . "</div>";
            }
        } else {
            echo "<div class='error'>✗ File not found: $fullPath</div>";
        }
    }
} else {
    echo "<h2>5. Admin API Test Skipped</h2>";
    echo "<div class='warning'>⚠ Not logged in as admin - admin API tests skipped</div>";
}

// Test 6: React Frontend Configuration
echo "<h2>6. React Frontend Configuration</h2>";

$reactConfigPath = __DIR__ . '/react-frontend/package.json';
if (file_exists($reactConfigPath)) {
    echo "<div class='success'>✓ React frontend found</div>";
    
    $packageJson = json_decode(file_get_contents($reactConfigPath), true);
    if ($packageJson) {
        echo "<div class='info'>React version: " . ($packageJson['dependencies']['react'] ?? 'Unknown') . "</div>";
        echo "<div class='info'>Proxy configured: " . (isset($packageJson['proxy']) ? 'Yes (' . $packageJson['proxy'] . ')' : 'No') . "</div>";
    }
} else {
    echo "<div class='error'>✗ React frontend not found</div>";
}

// Test 7: File Permissions
echo "<h2>7. File Permissions Test</h2>";

$criticalPaths = [
    __DIR__ . '/api',
    __DIR__ . '/config',
    __DIR__ . '/includes',
    __DIR__ . '/uploads'
];

foreach ($criticalPaths as $path) {
    if (is_dir($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        $readable = is_readable($path) ? '✓' : '✗';
        $writable = is_writable($path) ? '✓' : '✗';
        echo "<div class='info'>$path: Permissions $perms | Readable $readable | Writable $writable</div>";
    } else {
        echo "<div class='error'>✗ Directory not found: $path</div>";
    }
}

echo "<h2>Diagnostic Complete</h2>";
echo "<p>Please review the results above to identify any issues preventing data fetching.</p>";
?>
