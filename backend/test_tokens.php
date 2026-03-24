<?php

$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tenant = \App\Models\Tenant::first();
if (!$tenant) {
    echo "No tenant found.\n";
    exit;
}

echo "Tenant ID: {$tenant->id}\n";

// Central DB
$centralTokens = \Illuminate\Support\Facades\DB::connection('mysql')->table('personal_access_tokens')->count();
echo "Central DB Tokens: {$centralTokens}\n";

// Tenant DB
tenancy()->initialize($tenant);
$tenantTokens = \Illuminate\Support\Facades\DB::table('personal_access_tokens')->count();
echo "Tenant DB Tokens: {$tenantTokens}\n";

// Create token
$user = \App\Models\User::first();
if (!$user) {
    echo "No user found in tenant DB.\n";
    exit;
}
$token = $user->createToken('test_impersonation')->plainTextToken;

echo "Created Token for {$user->email}\n";

// Check where it went
$newCentral = \Illuminate\Support\Facades\DB::connection('mysql')->table('personal_access_tokens')->count();
$newTenant = \Illuminate\Support\Facades\DB::table('personal_access_tokens')->count();

echo "New Central DB Tokens: {$newCentral} (diff: " . ($newCentral - $centralTokens) . ")\n";
echo "New Tenant DB Tokens: {$newTenant} (diff: " . ($newTenant - $tenantTokens) . ")\n";

// Try Sanctum lookup explicitly
$parsed = explode('|', $token, 2);
if (count($parsed) === 2) {
    $found = \Laravel\Sanctum\PersonalAccessToken::findToken($parsed[1]);
    echo "Sanctum findToken() returned: " . ($found ? "FOUND (ID: {$found->id}, Connection: {$found->getConnectionName()})" : "NOT FOUND") . "\n";
}
