<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$tenant1 = \App\Models\Tenant::where("data->whatsapp_id", "99887766")->first();
echo "Query 1 (data->whatsapp_id): " . ($tenant1 ? $tenant1->id : "NOT FOUND") . "\n";

$tenant2 = \App\Models\Tenant::whereJsonContains('data', ['whatsapp_id' => '99887766'])->first();
echo "Query 2 (whereJsonContains): " . ($tenant2 ? $tenant2->id : "NOT FOUND") . "\n";

$tenant3 = \App\Models\Tenant::get()->filter(function($t) { return $t->whatsapp_id == '99887766'; })->first();
echo "Query 3 (collection filter): " . ($tenant3 ? $tenant3->id : "NOT FOUND") . "\n";
