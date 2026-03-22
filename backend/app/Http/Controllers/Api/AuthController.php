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
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if ($request->is('central-api/*')) {
            $user = \App\Models\Admin::where('email', $request->email)->first();
        } else {
            $user = User::where('email', $request->email)->first();
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'The provided credentials are incorrect.'], 401);
        }

        // Check 2FA preference
        if ($user->two_factor_method !== 'none') {
            if ($user->two_factor_method === 'email') {
                $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
                $user->update([
                    'two_factor_code' => $code,
                    'two_factor_expires_at' => now()->addMinutes(10),
                ]);

                // Fetch template
                $template = \App\Models\EmailTemplate::where('slug', '2fa_code')->first();
                $subject = $template ? $template->subject : 'Your Security Code';
                $content = $template ? $template->content : "Your security verification code is: {code}";
                $platformName = \App\Models\SaaSSetting::get('platform_name', 'Resevit');

                // Send Email via SystemMail
                try {
                    \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail($subject, $content, [
                        'name' => $user->name,
                        'code' => $code,
                        'platform_name' => $platformName
                    ]));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Failed to send 2FA email: " . $e->getMessage());
                }
            }

            return response()->json([
                'requires_2fa' => true,
                'method'       => $user->two_factor_method,
                'email'        => $user->email,
            ]);
        }

        return $this->issueToken($user);
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

        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            // Generate a unique tenant ID based on business name
            $tenantId = \Illuminate\Support\Str::slug($validated['business_name']);
            if (Tenant::where('id', $tenantId)->exists()) {
                $tenantId = $tenantId . '-' . rand(1000, 9999);
            }

            // Create Tenant
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

            $centralDomain = config('tenancy.central_domains')[0] ?? 'localhost';
            $tenant->domains()->create(['domain' => $tenantId . '.' . $centralDomain]);

            // Create User associated with Tenant
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'owner',
                'tenant_id' => $tenant->id,
            ]);

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration successful',
                'user' => $user
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
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
}
