// Diagnostic Ping
Route::get('/ping', function() { return response()->json(['message' => 'pong', 'connection' => config('database.default')]); });

// Global Webhooks
Route::post('/social/webhook', [\App\Http\Controllers\Api\CentralWebhookController::class, 'handle']);
Route::get('/social/webhook', [\App\Http\Controllers\Api\CentralWebhookController::class, 'verify']);

// Payment Webhooks
Route::post('/webhooks/stripe', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handleStripe']);
Route::post('/webhooks/paystack', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handlePaystack']);
Route::post('/webhooks/flutterwave', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handleFlutterwave']);

// Public Tenant Auth (Central Domain Login)
Route::middleware('throttle:6,1')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
    Route::post('/login/token', [\App\Http\Controllers\Api\AuthController::class, 'loginWithToken']);
    Route::post('/login/verify-2fa', [\App\Http\Controllers\Api\AuthController::class, 'verify2FA']);
    Route::post('/auth/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
    Route::post('/forgot-password', [\App\Http\Controllers\Api\AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [\App\Http\Controllers\Api\AuthController::class, 'resetPassword']);
});

// Public CMS (Move here for global access)
Route::group(['prefix' => 'public'], function () {
    Route::get('/blogs', [\App\Http\Controllers\Api\PublicCMSController::class, 'getBlogs']);
    Route::get('/blogs/{slug}', [\App\Http\Controllers\Api\PublicCMSController::class, 'getBlog']);
    
    Route::get('/customer-stories', [\App\Http\Controllers\Api\PublicCMSController::class, 'getCustomerStories']);
    Route::get('/customer-stories/{slug}', [\App\Http\Controllers\Api\PublicCMSController::class, 'getCustomerStory']);

    Route::get('/docs', [\App\Http\Controllers\Api\PublicCMSController::class, 'getDocs']);
    Route::get('/help', [\App\Http\Controllers\Api\PublicCMSController::class, 'getHelp']);
    
    Route::get('/translations/{locale}', [\App\Http\Controllers\Api\SuperAdmin\TranslationController::class, 'fetch']);
});
