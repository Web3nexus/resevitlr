<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SubscriptionPlan;

$plans = SubscriptionPlan::all();
foreach ($plans as $plan) {
    echo "Plan: {$plan->name} ({$plan->slug})\n";
    echo "Features: " . json_encode($plan->features) . "\n";
    echo "-------------------\n";
}
