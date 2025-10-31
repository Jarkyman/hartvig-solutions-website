<?php
// PHP wrapper for mapdata.json to bypass InfinityFree anti-bot protection
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, User-Agent, Accept');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set proper headers to avoid caching issues
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Read and output the JSON file
$jsonFile = '../mapdata.json';

if (file_exists($jsonFile)) {
    $jsonContent = file_get_contents($jsonFile);

    // Validate that it's actually JSON
    if (json_decode($jsonContent) !== null) {
        echo $jsonContent;
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Invalid JSON in file']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'mapdata.json not found']);
}
