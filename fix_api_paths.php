<?php
/**
 * Fix API Path Issues Script
 * This script fixes relative path issues in all API files
 */

echo "<h1>Fixing API Path Issues</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .success { color: green; background: #e8f5e9; padding: 10px; margin: 5px 0; }
    .error { color: red; background: #ffebee; padding: 10px; margin: 5px 0; }
    .info { color: blue; background: #e3f2fd; padding: 10px; margin: 5px 0; }
</style>";

// Function to recursively find all PHP files in API directories
function findApiFiles($dir) {
    $files = [];
    if (is_dir($dir)) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $files[] = $file->getPathname();
            }
        }
    }
    return $files;
}

// Function to fix relative paths in a file
function fixPathsInFile($filePath) {
    $content = file_get_contents($filePath);
    $originalContent = $content;
    
    // Fix common relative path patterns
    $patterns = [
        "/require_once\s+['\"]\.\.\/includes\/cors\.php['\"]/",
        "/require_once\s+['\"]\.\.\/config\/database\.php['\"]/",
        "/require_once\s+['\"]\.\.\/includes\/auth\.php['\"]/",
        "/require_once\s+['\"]\.\.\/includes\/security\.php['\"]/",
        "/require_once\s+['\"]\.\.\/includes\/functions\.php['\"]/",
        "/include_once\s+['\"]\.\.\/includes\/cors\.php['\"]/",
        "/include_once\s+['\"]\.\.\/config\/database\.php['\"]/",
        "/include_once\s+['\"]\.\.\/includes\/auth\.php['\"]/",
        "/include_once\s+['\"]\.\.\/includes\/security\.php['\"]/",
        "/include_once\s+['\"]\.\.\/includes\/functions\.php['\"]/",
    ];
    
    $replacements = [
        "require_once __DIR__ . '/../includes/cors.php'",
        "require_once __DIR__ . '/../config/database.php'",
        "require_once __DIR__ . '/../includes/auth.php'",
        "require_once __DIR__ . '/../includes/security.php'",
        "require_once __DIR__ . '/../includes/functions.php'",
        "include_once __DIR__ . '/../includes/cors.php'",
        "include_once __DIR__ . '/../config/database.php'",
        "include_once __DIR__ . '/../includes/auth.php'",
        "include_once __DIR__ . '/../includes/security.php'",
        "include_once __DIR__ . '/../includes/functions.php'",
    ];
    
    $content = preg_replace($patterns, $replacements, $content);
    
    // Check if any changes were made
    if ($content !== $originalContent) {
        if (file_put_contents($filePath, $content)) {
            return true;
        }
    }
    
    return false;
}

// Find all API files
$apiDirectories = [
    __DIR__ . '/api',
    __DIR__ . '/api/admin',
    __DIR__ . '/api/employer',
    __DIR__ . '/api/applicant',
    __DIR__ . '/api/auth'
];

$allFiles = [];
foreach ($apiDirectories as $dir) {
    $files = findApiFiles($dir);
    $allFiles = array_merge($allFiles, $files);
}

echo "<div class='info'>Found " . count($allFiles) . " PHP files to check</div>";

$fixedCount = 0;
$errorCount = 0;

foreach ($allFiles as $file) {
    $relativePath = str_replace(__DIR__ . '/', '', $file);
    
    try {
        if (fixPathsInFile($file)) {
            echo "<div class='success'>✓ Fixed paths in: $relativePath</div>";
            $fixedCount++;
        } else {
            echo "<div class='info'>- No changes needed: $relativePath</div>";
        }
    } catch (Exception $e) {
        echo "<div class='error'>✗ Error processing $relativePath: " . $e->getMessage() . "</div>";
        $errorCount++;
    }
}

echo "<h2>Summary</h2>";
echo "<div class='info'>Files processed: " . count($allFiles) . "</div>";
echo "<div class='success'>Files fixed: $fixedCount</div>";
if ($errorCount > 0) {
    echo "<div class='error'>Errors: $errorCount</div>";
}

echo "<h2>Next Steps</h2>";
echo "<p>1. Run the diagnostic script again: <a href='debug_apis.php'>debug_apis.php</a></p>";
echo "<p>2. Test the React frontend: <a href='http://localhost:3000/api-test'>API Test Page</a></p>";
echo "<p>3. Check the homepage: <a href='http://localhost:3000'>React Homepage</a></p>";
?>
