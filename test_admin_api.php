<?php
// Quick test to compare working vs non-working APIs
echo "<h1>API Comparison Test</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; background: #e8f5e9; padding: 10px; margin: 5px 0; }
    .error { color: red; background: #ffebee; padding: 10px; margin: 5px 0; }
    pre { background: #f5f5f5; padding: 10px; overflow-x: auto; }
</style>";

echo "<h2>Testing Working Public API</h2>";
try {
    ob_start();
    include 'api/stats.php';
    $output = ob_get_clean();
    echo "<div class='success'>✓ Public stats.php works</div>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
} catch (Exception $e) {
    echo "<div class='error'>✗ Public stats.php failed: " . $e->getMessage() . "</div>";
}

echo "<h2>Testing Admin API (with session)</h2>";
session_start();
// Simulate admin login for testing
$_SESSION['user_id'] = 1;
$_SESSION['role'] = 'admin';

try {
    ob_start();
    include 'api/admin/stats.php';
    $output = ob_get_clean();
    echo "<div class='success'>✓ Admin stats.php response</div>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
} catch (Exception $e) {
    echo "<div class='error'>✗ Admin stats.php failed: " . $e->getMessage() . "</div>";
}

echo "<h2>Session Info</h2>";
echo "<pre>" . print_r($_SESSION, true) . "</pre>";
?>
