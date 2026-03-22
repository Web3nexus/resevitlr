<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// 1. Setup - Request a reset to get a token
$tenant = \App\Models\Tenant::find('demo');
tenancy()->initialize($tenant);
$controller = new AuthController();

$tenantUserEmail = $tenant->owner_email;
$forgotRequest = new Request(['email' => $tenantUserEmail]);
$forgotRequest->setMethod('POST');
$controller->forgotPassword($forgotRequest);

// Get the token from DB
$tokenData = DB::table('password_reset_tokens')->where('email', $tenantUserEmail)->first();
$token = $tokenData->token;

echo "Token generated: $token\n";

// 2. Test Reset Password
$resetRequest = new Request([
    'email' => $tenantUserEmail,
    'token' => $token,
    'password' => 'newpassword123',
    'password_confirmation' => 'newpassword123'
]);
$resetRequest->setMethod('POST');
$resetRequest->server->set('REQUEST_URI', '/api/reset-password');

echo "Testing Reset Password for Tenant 'demo' ($tenantUserEmail)...\n";
$response = $controller->resetPassword($resetRequest);
echo "Response: " . $response->getContent() . "\n";

// Verify password changed
$user = \App\Models\User::where('email', $tenantUserEmail)->first();
if (Hash::check('newpassword123', $user->password)) {
    echo "SUCCESS: Password updated correctly.\n";
} else {
    echo "FAILURE: Password NOT updated.\n";
}

// Verify token deleted
$tokenDataAfter = DB::table('password_reset_tokens')->where('email', $tenantUserEmail)->first();
if (!$tokenDataAfter) {
    echo "SUCCESS: Token deleted correctly.\n";
} else {
    echo "FAILURE: Token still exists.\n";
}

echo "\nDone.\n";
