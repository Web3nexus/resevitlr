<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StaffProfile;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    public function index()
    {
        return response()->json(StaffProfile::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:staff_profiles',
            'role' => 'required|in:manager,waiter,chef,cashier',
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

        // Assign the role (Spatie)
        $user->syncRoles([$validated['role']]);

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
