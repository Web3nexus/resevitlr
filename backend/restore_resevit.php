<?php
$host = '127.0.0.1';
$db   = 'resevit';
$user = 'root';
$pass = 'Paul@02092002';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => true, // Required for executing multiple statements at once
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Drop and recreate DB
    echo "Dropping and recreating '$db' database...\n";
    $pdo->exec("DROP DATABASE IF EXISTS `$db`");
    $pdo->exec("CREATE DATABASE `$db`");
    $pdo->exec("USE `$db`");
    
    // Load SQL file
    $sqlFile = '/Users/vincent/Downloads/resevitv2 (2).sql';
    echo "Loading SQL from $sqlFile...\n";
    $sql = file_get_contents($sqlFile);
    
    // Execute SQL
    echo "Executing SQL dump...\n";
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
    $pdo->exec($sql);
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
    
    echo "Restoration of '$db' completed successfully.\n";
} catch (\PDOException $e) {
    echo "PDO Error: " . $e->getMessage() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
