<?php

namespace App\Http\Controllers\Api\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminUserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Admin::role('super_admin');

        // Developer Visibility Logic:
        // 1. If current user is developer, they see themselves + all other admins.
        // 2. If current user is NOT developer, they see all other admins EXCEPT developers.
        if (!$user->is_developer) {
            $query->where('is_developer', false);
        }

        return response()->json($query->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins',
            'password' => 'required|string|min:8',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $admin = Admin::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'permissions' => $request->permissions ?? [],
            'is_developer' => false // Never allow creating developers via API
        ]);

        $admin->assignRole('super_admin');

        return response()->json($admin, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        return response()->json(Admin::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:admins,email,' . $id,
            'password' => 'nullable|string|min:8',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $admin->name = $request->name ?? $admin->name;
        $admin->email = $request->email ?? $admin->email;
        if ($request->password) {
            $admin->password = Hash::make($request->password);
        }
        if ($request->has('permissions')) {
            $admin->permissions = $request->permissions;
        }
        $admin->save();

        return response()->json($admin);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $admin = Admin::findOrFail($id);

        if ($admin->is_developer) {
            return response()->json(['message' => 'Cannot delete developer account'], 403);
        }

        if ($admin->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin deleted successfully']);
    }

    public function toggle2FA(Request $request, string $id)
    {
        $admin = Admin::findOrFail($id);
        
        $request->validate(['enabled' => 'required|boolean']);
        
        $admin->update([
            'two_factor_method' => $request->enabled ? 'email' : 'none'
        ]);
        
        return response()->json([
            'message' => 'Admin 2FA updated successfully.',
            'two_factor_enabled' => $request->enabled
        ]);
    }
}
