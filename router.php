<?php
// Simple PHP router for project pages
$request_uri = $_SERVER['REQUEST_URI'];
$path = trim($request_uri, '/');

// List of valid projects
$valid_projects = ['flags-game', 'hint-master', 'util-master', 'jsontomodel'];

// Check if the path is a valid project
if (in_array($path, $valid_projects)) {
    // Redirect to the main page with hash
    header("Location: /#" . $path);
    exit();
}

// Check for project sub-paths (like /download, /app-ads.txt)
$path_parts = explode('/', $path);
if (count($path_parts) == 2 && in_array($path_parts[0], $valid_projects)) {
    $project = $path_parts[0];
    $sub_path = $path_parts[1];

    if ($sub_path === 'download') {
        // Redirect to download with hash
        header("Location: /#" . $project . "/download");
        exit();
    } elseif ($sub_path === 'app-ads.txt') {
        // Redirect to app-ads.txt with hash
        header("Location: /#" . $project . "/app-ads.txt");
        exit();
    }
}

// If not a project, serve the main index.html
include 'index.html';
