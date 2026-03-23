<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffProfile;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        $staff = StaffProfile::all()->map(function($member) {
            $user = \App\Models\User::where('email', $member->email)->first();
            $member->two_factor_enabled = $user && $user->two_factor_method !== 'none';
            return $member;
        });
        return response()->json($staff);
    }

    public function toggle2FA(Request $request, $id)
    {
        $staff = StaffProfile::findOrFail($id);
        $user = \App\Models\User::where('email', $staff->email)->firstOrFail();
        
        $request->validate(['enabled' => 'required|boolean']);
        
        $user->update([
            'two_factor_method' => $request->enabled ? 'email' : 'none'
        ]);
        
        return response()->json([
            'message' => 'Staff 2FA updated successfully.',
            'two_factor_enabled' => $request->enabled
        ]);
    }

    public function store(Request $request)
    {
        // 1. Check Max Staff Limit
        $tenant = tenant();
        $planSlug = $tenant->plan ?? 'free';

        $plan = \Stancl\Tenancy\Facades\Tenancy::central(function () use ($planSlug) {
            return \App\Models\SubscriptionPlan::where('slug', $planSlug)->first();
        });

        if ($plan && $plan->max_staff !== null) {
            $count = StaffProfile::count();
            
            if ($count >= $plan->max_staff) {
                return response()->json([
                    'error' => 'limit_reached',
                    'message' => "Maximum staff accounts limit of {$plan->max_staff} has been reached for your {$plan->name} plan.",
                    'limit' => $plan->max_staff
                ], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff_profiles',
            'role' => 'required|in:manager,waiter,chef,cashier,accountant',
            'is_active' => 'boolean',
        ]);

        // Create the profile record
        $staff = StaffProfile::create($validated);

        // Create a functional user account for login
        $user = \App\Models\User::firstOrCreate(
            ['email' => $validated['email']],
            [
                'name' => $validated['name'],
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            ]
        );

        // Assign the role (Spatie) - Dynamically ensure it exists in the tenant DB first
        $roleRecord = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $validated['role'], 'guard_name' => 'web']);
        $user->syncRoles([$roleRecord]);

        // Send Staff Registration Email
        $template = \App\Models\EmailTemplate::where('slug', 'staff_registration')->first();
        if ($template) {
            $platformName = \App\Models\SaaSSetting::get('platform_name', 'Resevit');
            $businessName = tenant('business_name') ?? 'Your Business';
            $loginUrl = 'https://' . (tenant('id') ? tenant('id') . '.' : '') . (config('tenancy.central_domains')[0] ?? 'resevit.com') . '/login';

            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\SystemMail($template->subject, $template->content, [
                    'name' => $user->name,
                    'business_name' => $businessName,
                    'platform_name' => $platformName,
                    'login_url' => $loginUrl,
                    'pin' => 'password123' // Matching the temp password
                ]));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Failed to send staff registration email: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Staff member and user account created successfully.',
            'staff' => $staff,
            'user_id' => $user->id,
            'temp_password' => 'password123'
        ], 201);
    }
}
