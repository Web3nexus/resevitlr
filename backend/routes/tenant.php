<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\AutomationController;
use App\Http\Controllers\Api\BrandingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    
    // Web Routes (Internal/Base)
    Route::middleware(['web'])->group(function () {
        Route::get('/', function () {
            return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
        })->name('login');
    });

    // API Routes for Tenant (Using tenant-api to bypass Nginx /api blocks)
    Route::middleware(['api'])->prefix('tenant-api')->group(function () {
        // Public Auth: login and validate token
        Route::middleware('throttle:6,1')->group(function () {
            Route::post('/login', [AuthController::class, 'login']);
            Route::post('/login/token', [AuthController::class, 'loginWithToken']);
            Route::post('/login/verify-2fa', [AuthController::class, 'verify2FA']);
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        });
        
        // Protected Routes
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/user', function (\Illuminate\Http\Request $request) {
                $user = $request->user();
                $tenant = tenant();
                
                $plan = $tenant ? tenancy()->central(function () use ($tenant) {
                    return \App\Models\SubscriptionPlan::where('slug', $tenant->plan)->first();
                }) : null;
                
                // Robust role detection: check Spatie first, then fallback to owner-check
                $rawRole = $user->roles->first()?->name;
                
                if (!$rawRole) {
                    // Case-insensitive email check for owner identification
                    $rawRole = (strtolower($user->email) === strtolower($tenant->owner_email ?? '')) ? 'restaurant_owner' : 'waitstaff';
                }
                
                $normalizedRole = ($rawRole === 'restaurant_owner' || $rawRole === 'owner') ? 'owner' : $rawRole;
                
                $platformName = tenancy()->central(function () {
                    return \App\Models\SaaSSetting::where('key', 'platform_name')->value('value') ?? 'Resevit';
                });
                
                return array_merge($user->toArray(), [
                    'role' => $normalizedRole,
                    'plan' => $tenant->plan ?? 'free',
                    'features' => $plan ? $plan->features : ['basic_ordering', 'menu_management'],
                    'platform_name' => $platformName,
                ]);
            });

            // Menu Management
            Route::get('/menu', [MenuController::class, 'index']);
            Route::post('/menu/categories', [MenuController::class, 'storeCategory']);
            Route::post('/menu/items', [MenuController::class, 'storeItem']);

            // Table Management
            Route::get('/tables', [TableController::class, 'index']);
            Route::post('/tables', [TableController::class, 'store']);
            Route::patch('/tables/{table}/status', [TableController::class, 'updateStatus']);

            // Staff Management
            Route::get('/staff', [StaffController::class, 'index']);
            Route::post('/staff', [StaffController::class, 'store']);

            // Branding & Settings
            Route::get('/branding', [BrandingController::class, 'index']);
            Route::post('/branding', [BrandingController::class, 'update']);

            Route::apiResource('/orders', OrderController::class);
            Route::apiResource('/reservations', ReservationController::class);
            Route::patch('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);

            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::post('/expenses', [ExpenseController::class, 'store']);

            // AI & Automation
            Route::prefix('automation')->group(function () {
                Route::get('/activity', [AutomationController::class, 'getActivity']);
                Route::get('/settings', [AutomationController::class, 'getSettings']);
                Route::post('/settings', [AutomationController::class, 'updateSettings']);
                Route::patch('/social-links', [AutomationController::class, 'updateSocialLinks']);
                Route::post('/social/webhook', [AutomationController::class, 'handleSocialWebhook']);
                Route::post('/scan-receipt', [AutomationController::class, 'scanReceipt']);
            });

            // Dashboard Stats
            Route::get('/dashboard/stats', [\App\Http\Controllers\Api\DashboardController::class, 'stats']);

            // Notifications
            Route::get('/notifications', [NotificationController::class, 'index']);
            Route::post('/notifications/settings', [NotificationController::class, 'updateSettings']);
            Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
            Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

            // Profile Management
            Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'index']);
            Route::post('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
            Route::post('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);

            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });
});
