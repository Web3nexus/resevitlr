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
    public function index()
    {
        return response()->json(Admin::role('super_admin')->get());
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
            'permissions' => $request->permissions ?? []
        ]);

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
    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);
        
        // Prevent deleting the last admin or yourself if needed
        // For now, just delete
        $admin->delete();

        return response()->json(null, 204);
    }
}
