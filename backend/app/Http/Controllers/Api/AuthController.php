<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;

class AuthController extends Controller
{
    /**
     * Authenticate a tenant user (Business Owner or Staff).
     */
    public function login(Request $request)
    {
        try {
            \Illuminate\Support\Facades\Log::info('DEBUG: Login attempt started', [
                'email' => $request->email,
                'path' => $request->path(),
                'method' => $request->method(),
            ]);

            $request->validate([
                'email'    => 'required|email',
                'password' => 'required',
            ]);

            // 1. Identify if this is an Admin (SaaS) login attempt.
            $isAdminPath = $request->is('central-api/saas/*') || 
                           $request->is('*/saas/*') || 
                           str_contains($request->path(), 'saas/');

            if (!$isAdminPath) {
                $isAdminEmail = \App\Models\Admin::where('email', $request->email)->exists();
                if ($isAdminEmail) {
                    $isAdminPath = true;
                    \Illuminate\Support\Facades\Log::info('DEBUG: Admin email detected on non-admin path', ['email' => $request->email]);
                }
            }

            if ($isAdminPath) {
                $user = \App\Models\Admin::where('email', $request->email)->first();
                if (!$user) {
                    \Illuminate\Support\Facades\Log::warning('DEBUG: Admin user not found', ['email' => $request->email]);
                    return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
                }
                
                if (!Hash::check($request->password, $user->password)) {
                    \Illuminate\Support\Facades\Log::warning('DEBUG: Admin password mismatch', ['email' => $request->email]);
                    return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
                }

                \Illuminate\Support\Facades\Log::info('DEBUG: Admin authenticated successfully', ['email' => $request->email]);

                // Handle 2FA for Super Admin
                $twoFactorMethod = $user->two_factor_method ?: 'none';
                if ($twoFactorMethod !== 'none') {
                    return $this->sendTwoFactorCode($user, $twoFactorMethod);
                }

                return $this->issueToken($user);
            }

            // Tenant user login
            $tenant = Tenant::where('owner_email', $request->email)->first();
            
            if (!$tenant) {
                \Illuminate\Support\Facades\Log::info('DEBUG: Tenant owner not found, searching staff', ['email' => $request->email]);
                $allTenants = Tenant::all();
                foreach ($allTenants as $t) {
                    $found = $t->run(function() use ($request) {
                        return User::where('email', $request->email)->first();
                    });
                    if ($found) {
                        $tenant = $t;
                        break;
                    }
                }
            }

            if (!$tenant) {
                \Illuminate\Support\Facades\Log::warning('DEBUG: No tenant found for user', ['email' => $request->email]);
                return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
            }

            // Authenticate within the tenant's database
            $authData = $tenant->run(function() use ($request) {
                $user = User::where('email', $request->email)->first();
                if (!$user || !Hash::check($request->password, $user->password)) {
                    return null;
                }
                return [
                    'id' => $user->id,
                    'email' => $user->email,
                    'name' => $user->name,
                    'two_factor_method' => $user->two_factor_method ?: 'none',
                    'array_data' => $user->toArray()
                ];
            });

            if (!$authData) {
                \Illuminate\Support\Facades\Log::warning('DEBUG: Tenant user authentication failed', ['email' => $request->email]);
                return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
            }

            // Check 2FA preference
            $twoFactorMethod = $authData['two_factor_method'];
            if ($twoFactorMethod !== 'none') {
                \Illuminate\Support\Facades\Log::info('DEBUG: Tenant user requires 2FA', ['email' => $request->email, 'method' => $twoFactorMethod]);
                if ($twoFactorMethod === 'email') {
                    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                    $tenant->run(function() use ($authData, $code) {
                        User::where('id', $authData['id'])->update([
                            'two_factor_code' => $code,
                            'two_factor_expires_at' => now()->addMinutes(10),
                        ]);
                    });

                    try {
                        $platformName = \App\Models\SaaSSetting::get('platform_name', 'Resevit');
                        \Illuminate\Support\Facades\Mail::to($authData['email'])->send(new \App\Mail\SystemMail(
                            'Your Security Code',
                            'Your security verification code is: {code}',
                            ['name' => $authData['name'], 'code' => $code, 'platform_name' => $platformName]
                        ));
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("DEBUG: Failed to send 2FA email: " . $e->getMessage());
                    }
                }

                return response()->json([
                    'requires_2fa' => true,
                    'method'       => $twoFactorMethod,
                    'email'        => $authData['email'],
                ]);
            }

            \Illuminate\Support\Facades\Log::info('DEBUG: Tenant user authenticated successfully', ['email' => $request->email]);
            
            // Issue token
            $tokenData = $tenant->run(function() use ($authData) {
                $user = User::find($authData['id']);
                $token = $user->createToken('auth-token')->plainTextToken;
                return $token;
            });

            $tenantDomain = $tenant->domains()->first()?->domain;

            return response()->json([
                'token'         => $tokenData,
                'user'          => $authData['array_data'],
                'tenant_domain' => $tenantDomain,
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('DEBUG: Critical login failure', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'An internal error occurred during login.'], 500);
        }
    }


    /**
     * Register a new tenant owner and verify Turnstile CAPTCHA.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'country' => 'required|string|size:2',
            'turnstile_token' => 'required|string'
        ]);

        // Verify Turnstile Token — key priority: DB setting > .env > dummy test key
        $turnstileSecret = \App\Models\SaaSSetting::get('turnstile_secret_key')
            ?: env('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA');
        $response = \Illuminate\Support\Facades\Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $turnstileSecret,
            'response' => $validated['turnstile_token'],
            'remoteip' => $request->ip()
        ]);

        if (!$response->json('success')) {
            return response()->json(['message' => 'CAPTCHA validation failed. Please try again.'], 400);
        }

        // Check if email is already registered as a tenant owner
        if (Tenant::where('owner_email', $validated['email'])->exists()) {
            return response()->json(['message' => 'This email is already registered with a business.'], 422);
        }

        try {
            // Generate a unique tenant ID based on business name
            $tenantId = \Illuminate\Support\Str::slug($validated['business_name']);
            if (Tenant::where('id', $tenantId)->exists()) {
                $tenantId = $tenantId . '-' . rand(1000, 9999);
            }

            // Phase 1: Create Tenant
            try {
                $tenant = Tenant::create([
                    'id' => $tenantId,
                    'business_name' => $validated['business_name'],
                    'plan' => 'free',
                    'owner_email' => $validated['email'],
                    'owner_name' => $validated['name'],
                    'status' => 'active',
                    'data' => [
                        'status' => 'active',
                        'owner_name' => $validated['name'],
                        'owner_email' => $validated['email'],
                    ]
                ]);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 1 (Tenant Creation): ' . $e->getMessage()], 500);
            }

            // Phase 2: Create Domain
            try {
                $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
                $tenant->domains()->create(['domain' => $tenantId . '.' . $centralDomain]);
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 2 (Domain Creation): ' . $e->getMessage()], 500);
            }

            // Phase 3: Create User
            try {
                $userData = $tenant->run(function () use ($validated, $tenant) {
                    $u = User::create([
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
                        'role' => 'owner',
                        'tenant_id' => $tenant->id,
                    ]);
                    // Mathematically force timestamp and connection resolution BEFORE tenancy ends
                    return $u->toArray();
                });
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 3 (User Creation): ' . $e->getMessage()], 500);
            }

            // Phase 4: Welcome Email
            try {
                // Ensure default connection is heavily forced back to central
                \Illuminate\Support\Facades\DB::setDefaultConnection('mysql');
                $template = \App\Models\EmailTemplate::where('slug', 'welcome_email')->first();
            } catch (\Exception $e) {
                return response()->json(['message' => 'Registration failed at Phase 4 (Email Template Fetch): ' . $e->getMessage()], 500);
            }
            $subject = $template ? $template->subject : 'Welcome to Resevit';
            $content = $template ? $template->content : "Hello {name}, your account has been created successfully. Welcome to {platform_name}!";
            
            $platformName = \App\Models\SaaSSetting::get('platform_name', 'Resevit');
            
            try {
                \Illuminate\Support\Facades\Mail::to($userData['email'])->send(new \App\Mail\SystemMail($subject, $content, [
                    'name' => $userData['name'],
                    'platform_name' => $platformName,
                    'business_name' => $validated['business_name']
                ]));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send welcome email: " . $e->getMessage());
            }

            // Generate auth token for auto-login after registration
            $authToken = $tenant->run(function () use ($userData) {
                $freshUser = \App\Models\User::where('email', $userData['email'])->first();
                return $freshUser ? $freshUser->createToken('auth-token')->plainTextToken : null;
            });

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'tenant_id' => $tenant->id,
                'domain' => $tenant->domains()->first()->domain,
                'token' => $authToken,
                'user' => $userData
            ], 201);
        } catch (\Exception $e) {
            // Rollback: If anything fails after the tenant is created, delete the tenant completely to avoid orphaned/half-done businesses
            if (isset($tenant) && $tenant) {
                try {
                    $tenant->delete();
                } catch (\Exception $deleteEx) {
                    \Illuminate\Support\Facades\Log::error("Failed to delete partially created tenant: " . $deleteEx->getMessage());
                }
            }
            return response()->json([
                'message' => 'Registration failed: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => collect($e->getTrace())->take(15)->map(function($t) { 
                    return [
                        'file' => $t['file'] ?? '',
                        'line' => $t['line'] ?? '',
                        'function' => $t['function'] ?? '',
                        'class' => $t['class'] ?? ''
                    ]; 
                })->toArray()
            ], 500);
        }
    }

    /**
     * Auto-login using a pre-issued Sanctum token (for impersonation handoff).
     */
    public function loginWithToken(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        // personal_access_tokens is ALWAYS in the central database.
        // When on a tenant subdomain, tenancy switches the default DB connection.
        // We cannot use ::on('mysql')->findToken() as ::on() returns a Builder, not the model.
        // Sanctum stores tokens as: token_id|plaintext_token in the DB the hash is sha256(plaintext)
        $parts = explode('|', $request->token, 2);
        if (count($parts) !== 2) {
            return response()->json(['message' => 'Invalid token format.'], 401);
        }
        [$tokenId, $plaintext] = $parts;

        // Try current connection first (tenant-aware)
        $tokenRow = \Illuminate\Support\Facades\DB::table('personal_access_tokens')
            ->where('id', $tokenId)
            ->first();

        // Fallback to central if not found (e.g. for central-to-central impersonation)
        if (!$tokenRow) {
            $tokenRow = \Illuminate\Support\Facades\DB::connection('mysql')
                ->table('personal_access_tokens')
                ->where('id', $tokenId)
                ->first();
        }

        if (!$tokenRow) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        // Verify hash matches
        if (!hash_equals($tokenRow->token, hash('sha256', $plaintext))) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        // Check expiry
        if ($tokenRow->expires_at && now()->isAfter($tokenRow->expires_at)) {
            return response()->json(['message' => 'Token has expired.'], 401);
        }

        $userId    = $tokenRow->tokenable_id;
        $userClass = $tokenRow->tokenable_type;
        $user      = $userClass::find($userId);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // The tenant context is already active via InitializeTenancyByDomain middleware
        // Use tenant() helper to get current tenant and determine role accurately
        $currentTenant = tenant();
        $isOwner = $currentTenant && $user->email === $currentTenant->owner_email;

        // Get plan info from the central DB (Tenant model lives there)
        $plan = $currentTenant ? SubscriptionPlan::where('slug', $currentTenant->plan)->first() : null;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $request->token,
            'user'    => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'role'      => $isOwner ? 'owner' : ($user->role ?? ($user->roles?->first()?->name ?? 'staff')),
                'is_owner'  => $isOwner,
                'tenant_id' => $currentTenant?->id,
                'plan'      => $currentTenant?->plan ?? 'free',
                'features'  => array_values((array) ($currentTenant?->features ?? ($plan?->features ?? ['basic_ordering', 'menu_management']))),
            ],
        ]);
    }

    /**
     * Issue Sanctum token and return user data.
     */
    protected function issueToken($user)
    {
        if (request()->is('central-api/*')) {
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json([
                'message' => 'Login successful',
                'token'   => $token,
                'user'    => [
                    'id'        => $user->id,
                    'name'      => $user->name,
                    'email'     => $user->email,
                    'role'      => 'admin',
                ],
            ]);
        }

        $tenant = Tenant::find($user->tenant_id);
        $plan = $tenant ? SubscriptionPlan::where('slug', $tenant->plan)->first() : null;

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'tenant_domain' => $tenant ? $tenant->domains->first()?->domain : null,
            'user'    => [
                'id'        => $user->id,
                'name'      => $user->name,
                'email'     => $user->email,
                'role'      => $user->role,
                'tenant_id' => $user->tenant_id,
                'plan'      => $tenant?->plan ?? 'free',
                'features'  => array_values((array) ($tenant->features ?? ($plan?->features ?? ['basic_ordering', 'menu_management']))),
            ],
        ]);
    }

    /**
     * Verify any 2FA method (Email Code, TOTP, or PIN).
     */
    public function verify2FA(Request $request)
    {
        $request->validate([
            'email'  => 'required|email',
            'code'   => 'required|string',
            'method' => 'required|in:email,totp,pin',
        ]);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::where('email', $request->email)->firstOrFail();
        } else {
            $user = User::where('email', $request->email)->firstOrFail();
        }

        if ($request->method === 'email') {
            if ($user->two_factor_code !== $request->code || now()->greaterThan($user->two_factor_expires_at)) {
                return response()->json(['message' => 'Invalid or expired verification code.'], 401);
            }
        } elseif ($request->method === 'totp') {
            $google2fa = new \PragmaRX\Google2FA\Google2FA();
            $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);
            if (!$valid) {
                 return response()->json(['message' => 'Invalid Google Authenticator code.'], 401);
            }
        } elseif ($request->method === 'pin') {
            if (!Hash::check($request->code, $user->login_pin)) {
                return response()->json(['message' => 'Invalid PIN.'], 401);
            }
        }

        // Clear temporary code
        $user->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        return $this->issueToken($user);
    }

    /**
     * Stateless logout.
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }
        
        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Send a password reset link to the user.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::where('email', $request->email)->first();
            $connection = 'mysql';
        } else {
            $user = User::where('email', $request->email)->first();
            $connection = config('database.default');
        }

        if (!$user) {
            // We return success to avoid email enumeration
            return response()->json(['message' => 'If your email is in our system, you will receive a reset link shortly.']);
        }

        $token = \Illuminate\Support\Str::random(64);

        \Illuminate\Support\Facades\DB::connection($connection)->table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $token, 'created_at' => now()]
        );

        $template = \App\Models\EmailTemplate::where('slug', 'password_reset')->first();
        $subject = $template ? $template->subject : 'Reset Your Password';
        $content = $template ? $template->content : "Hello {name}, click the link below to reset your password: {reset_link}";

        $domain = $request->header('X-Tenant-Domain') ?? $request->getHost();
        $protocol = $request->getScheme();
        $resetLink = "{$protocol}://{$domain}/reset-password?token={$token}&email=" . urlencode($user->email);

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail($subject, $content, [
                'name' => $user->name,
                'reset_link' => $resetLink,
                'platform_name' => \App\Models\SaaSSetting::get('platform_name', 'Resevit')
            ]));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send password reset email: " . $e->getMessage());
        }

        return response()->json(['message' => 'If your email is in our system, you will receive a reset link shortly.']);
    }

    /**
     * Reset the user's password using the provided token.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::where('email', $request->email)->first();
            $connection = 'mysql';
        } else {
            $user = User::where('email', $request->email)->first();
            $connection = config('database.default');
        }

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $record = \Illuminate\Support\Facades\DB::connection($connection)->table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$record || now()->subHours(2)->greaterThan($record->created_at)) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 400);
        }

        $user->update(['password' => Hash::make($request->password)]);

        \Illuminate\Support\Facades\DB::connection($connection)->table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json(['message' => 'Password reset successfully. You can now log in.']);
    }

    /**
     * Helper to send 2FA code and return the required response.
     */
    protected function sendTwoFactorCode($user, $method)
    {
        if ($method === 'email') {
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $user->update([
                'two_factor_code' => $code,
                'two_factor_expires_at' => now()->addMinutes(10),
            ]);

            try {
                $platformName = \App\Models\SaaSSetting::get('platform_name', 'Resevit');
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail(
                    'Your Security Code',
                    'Your security verification code is: {code}',
                    ['name' => $user->name, 'code' => $code, 'platform_name' => $platformName]
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send 2FA email: " . $e->getMessage());
            }
        }

        return response()->json([
            'requires_2fa' => true,
            'method'       => $method,
            'email'        => $user->email,
        ]);
    }
}
