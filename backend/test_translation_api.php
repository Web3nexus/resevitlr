<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\SuperAdmin\TranslationController;

$controller = new TranslationController();
$response = $controller->fetch('en');

echo "Response Status: " . $response->getStatusCode() . "\n";
echo "Response Body: \n";
echo json_encode(json_decode($response->getContent()), JSON_PRETTY_PRINT);
echo "\n";
