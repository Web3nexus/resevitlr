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
            ['email' => 'landlord@securegate.com'],
            [
                'name' => 'System Landlord',
                'password' => Hash::make('paul1234'),
            ]
        );

        // Assign Role
        $landlord->assignRole($superAdminRole);
    }
}
