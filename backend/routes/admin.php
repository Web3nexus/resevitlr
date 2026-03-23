<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdmin\AdminUserController;
use App\Http\Controllers\Api\SuperAdmin\SaaSController;
use App\Http\Controllers\Api\SuperAdmin\SaaSCMSAdminController;
use App\Http\Controllers\Api\SuperAdmin\TranslationController;
use App\Http\Controllers\Api\TenantController;

// Public Branding & Tenant Lookup
Route::get('/public/branding', [SaaSController::class, 'getPublicBranding']);
Route::get('/public/tenant-by-domain/{domain}', [SaaSController::class, 'getTenantByDomain']);

// Public Auth
Route::prefix('saas')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/login/verify-2fa', [AuthController::class, 'verify2FA']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// User Profile (Central)
Route::get('/user', function (Request $request) {
    $user = $request->user();
    $tenant = \App\Models\Tenant::find($user->tenant_id);
    $plan = $tenant ? \App\Models\SubscriptionPlan::where('slug', $tenant->plan)->first() : null;
    $platformName = \App\Models\SaaSSetting::where('key', 'platform_name')->value('value') ?? 'Resevit';
    
    return array_merge($user->toArray(), [
        'plan' => $tenant?->plan ?? 'free',
        'features' => $plan ? $plan->features : ['basic_ordering', 'menu_management'],
        'platform_name' => $platformName,
        'role' => $user->role ?? 'admin',
    ]);
})->middleware('auth:sanctum');

// SaaS Super Admin
Route::middleware(['auth:sanctum'])->prefix('saas')->group(function () {
    // Admin Management
    Route::get('/admins', [AdminUserController::class, 'index']);
    Route::post('/admins', [AdminUserController::class, 'store']);
    Route::put('/admins/{id}', [AdminUserController::class, 'update']);
    Route::patch('/admins/{id}/2fa', [AdminUserController::class, 'toggle2FA']);
    Route::delete('/admins/{id}', [AdminUserController::class, 'destroy']);
    
    // Tenant Management
    Route::get('/tenants', [SaaSController::class, 'getTenants']);
    Route::post('/tenants', [SaaSController::class, 'storeTenant']);
    Route::patch('/tenants/{id}/status', [SaaSController::class, 'updateTenantStatus']);
    Route::patch('/tenants/{id}', [SaaSController::class, 'updateTenant']);
    Route::get('/tenants/{id}/staff', [SaaSController::class, 'getTenantStaff']);
    Route::get('/tenants/{id}/impersonate', [SaaSController::class, 'impersonate']);
    Route::delete('/tenants/{id}', [SaaSController::class, 'destroyTenant']);
    
    // Stats & Health
    Route::get('/stats', [SaaSController::class, 'getDashboardStats']);
    Route::get('/health', [SaaSController::class, 'getSystemHealth']);
    Route::get('/tickets', [SaaSController::class, 'getSupportTickets']);
    
    // Subscription Plans
    Route::get('/plans', [SaaSController::class, 'getSubscriptionPlans']);
    Route::post('/plans', [SaaSController::class, 'storeSubscriptionPlan']);
    Route::delete('/plans/{id}', [SaaSController::class, 'destroySubscriptionPlan']);
    
    // Email Templates
    Route::get('/email-templates', [SaaSController::class, 'getEmailTemplates']);
    Route::post('/email-templates', [SaaSController::class, 'storeEmailTemplate']);
    Route::delete('/email-templates/{id}', [SaaSController::class, 'destroyEmailTemplate']);
    
    // Settings
    Route::get('/settings', [SaaSController::class, 'getSettings']);
    Route::post('/settings', [SaaSController::class, 'updateSettings']);
    Route::post('/settings/upload-branding', [SaaSController::class, 'uploadBranding']);
    
    // CMS Management
    Route::prefix('cms')->group(function () {
        Route::get('/blogs', [SaaSCMSAdminController::class, 'blogs']);
        Route::post('/blogs', [SaaSCMSAdminController::class, 'storeBlog']);
        Route::get('/stories', [SaaSCMSAdminController::class, 'stories']);
        Route::get('/docs', [SaaSCMSAdminController::class, 'docs']);
    });

    // Translation Management
    Route::get('/translations', [TranslationController::class, 'index']);
    Route::post('/translations', [TranslationController::class, 'store']);
    Route::put('/translations/{id}', [TranslationController::class, 'update']);
    Route::delete('/translations/{id}', [TranslationController::class, 'destroy']);

# Move out of prefix group
});

// Profile Management (Central) - Keep it consistent with /api/profile
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'index']);
    Route::post('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::post('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);
    Route::post('/profile/email-otp', [\App\Http\Controllers\Api\ProfileController::class, 'sendEmailOTP']);
    Route::post('/profile/verify-email', [\App\Http\Controllers\Api\ProfileController::class, 'verifyEmailOTP']);
    Route::delete('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'destroy']);
});

// Tenants list for registration etc.
Route::post('/tenants', [TenantController::class, 'store']);

// Public Translations & CMS (Load these in api.php if needed publically)
Route::get('/public/translations/{locale}', [TranslationController::class, 'fetch']);
