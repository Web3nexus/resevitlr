<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\StaffProfile;
use Spatie\Permission\Models\Role;

class TenantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Set up Roles for the Tenant context
        $ownerRole = Role::firstOrCreate(['name' => 'restaurant_owner', 'guard_name' => 'web']);
        $waiterRole = Role::firstOrCreate(['name' => 'waiter', 'guard_name' => 'web']);

        // 2. Create the Business Owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@demo.com'],
            [
                'name' => 'Demo Owner',
                'password' => Hash::make('paul1234'),
            ]
        );
        $owner->assignRole($ownerRole);

        // 3. Create a Staff Member (Waiter/Cashier)
        $staffUser = User::firstOrCreate(
            ['email' => 'waiter@demo.com'],
            [
                'name' => 'Sarah The Waitress',
                'password' => Hash::make('paul1234'),
            ]
        );
        $staffUser->assignRole($waiterRole);

        // Link the Staff Profile
        StaffProfile::firstOrCreate(
            ['user_id' => $staffUser->id],
            [
                'role' => 'waiter',
                'pin' => '1234', // For quick POS login
                'hourly_rate' => 15.00
            ]
        );
    }
}
