<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Business Owner - Demo Restaurant
        User::firstOrCreate(
            ['email' => 'owner@demo.com'],
            [
                'name'      => 'Demo Owner',
                'password'  => Hash::make('paul1234'),
                'role'      => 'owner',
                'tenant_id' => 'demo-restaurant',
            ]
        );

        // Waiter - Demo Restaurant
        User::firstOrCreate(
            ['email' => 'waiter@demo.com'],
            [
                'name'      => 'Demo Waiter',
                'password'  => Hash::make('paul1234'),
                'role'      => 'waiter',
                'tenant_id' => 'demo-restaurant',
            ]
        );
    }
}
