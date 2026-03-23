<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define SaaS Landlord Role
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'admin']);

        // Create the Landlord
        $landlord = Admin::firstOrCreate(
            ['email' => 'admin@resevit.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('Admin123!'),
                'is_developer' => true,
            ]
        );

        // Assign Role
        $landlord->assignRole($superAdminRole);
    }
}
