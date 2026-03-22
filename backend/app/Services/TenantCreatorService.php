<?php

namespace App\Services;

use App\Models\Tenant;
use App\Models\Admin;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TenantCreatorService
{
    /**
     * Register a new business owner, create their tenant DB, and initialize their space.
     */
    public function registerBusiness(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            // 1. Create the tenant record & database
            $tenant = Tenant::create([
                'id' => $data['domain_prefix'],
                'business_name' => $data['business_name'],
                'plan' => $data['plan'] ?? 'free',
            ]);

            // 2. Attach domain mapping
            $tenant->domains()->create([
                'domain' => $data['domain_prefix'] . '.' . config('tenancy.central_domains')[0],
            ]);

            // 3. (Inside Tenant Context) Create the Business Owner user
            $tenant->run(function () use ($data) {
                // Here we would create the App\Models\User inside the tenant DB
                // Assign "business_owner" Spatie role
                
                // For MVP setup, assuming the tenant User model exists:
                /*
                $owner = \App\Models\User::create([
                    'name' => $data['owner_name'],
                    'email' => $data['owner_email'],
                    'password' => Hash::make($data['password']),
                ]);
                $owner->assignRole('business_owner');
                */
            });

            return $tenant;
        });
    }
}
