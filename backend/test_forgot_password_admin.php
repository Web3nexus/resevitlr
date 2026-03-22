<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

$controller = new AuthController();
$adminEmail = 'admin@resevit.com';

// 1. Setup - Request a reset to get a token
$forgotRequest = new Request(['email' => $adminEmail]);
$forgotRequest->setMethod('POST');
$forgotRequest->server->set('REQUEST_URI', '/central-api/saas/forgot-password');
$controller->forgotPassword($forgotRequest);

// Get the token from central DB (connection 'mysql')
$tokenData = DB::connection('mysql')->table('password_reset_tokens')->where('email', $adminEmail)->first();
$token = $tokenData->token;

echo "Admin Token generated: $token\n";

// 2. Test Reset Password
$resetRequest = new Request([
    'email' => $adminEmail,
    'token' => $token,
    'password' => 'adminnew999',
    'password_confirmation' => 'adminnew999'
]);
$resetRequest->setMethod('POST');
$resetRequest->server->set('REQUEST_URI', '/central-api/saas/reset-password');

echo "Testing Reset Password for Admin ($adminEmail)...\n";
$response = $controller->resetPassword($resetRequest);
echo "Response Admin: " . $response->getContent() . "\n";

// Verify password changed on central DB
$admin = \App\Models\Admin::where('email', $adminEmail)->first();
if (Hash::check('adminnew999', $admin->password)) {
    echo "SUCCESS: Admin Password updated correctly.\n";
} else {
    echo "FAILURE: Admin Password NOT updated.\n";
}

// Verify token deleted on central DB
$tokenDataAfter = DB::connection('mysql')->table('password_reset_tokens')->where('email', $adminEmail)->first();
if (!$tokenDataAfter) {
    echo "SUCCESS: Admin Token deleted correctly.\n";
} else {
    echo "FAILURE: Admin Token still exists.\n";
}

echo "\nDone.\n";
