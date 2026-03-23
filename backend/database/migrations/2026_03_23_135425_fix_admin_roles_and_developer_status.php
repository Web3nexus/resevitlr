<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure the super_admin role exists for the admin guard
        $role = \Spatie\Permission\Models\Role::firstOrCreate([
            'name' => 'super_admin',
            'guard_name' => 'admin'
        ]);

        // 2. Assign the role to ALL existing admins who might have been created without it
        \App\Models\Admin::all()->each(function ($admin) use ($role) {
            if (!$admin->hasRole($role)) {
                $admin->assignRole($role);
            }
        });

        // 3. Ensure the primary admin is marked as a developer
        \App\Models\Admin::where('email', 'admin@resevit.com')->update(['is_developer' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reverse for data fixes usually, but we could remove roles if needed.
    }
};
