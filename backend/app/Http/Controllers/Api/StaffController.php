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

        return response()->json([
            'message' => 'Staff member and user account created successfully.',
            'staff' => $staff,
            'user_id' => $user->id,
            'temp_password' => 'password123'
        ], 201);
    }
}
