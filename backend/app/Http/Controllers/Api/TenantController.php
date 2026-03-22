<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class TenantController extends Controller
{
    public function store(Request $request)
    {
        $isDisabled = (bool) \App\Models\SaaSSetting::get('disable_public_signups', false);
        if ($isDisabled) {
            return response()->json([
                'message' => 'Public signups are currently disabled. Please contact an administrator.'
            ], 403);
        }

        $validated = $request->validate([
            'id' => 'required|string|unique:tenants',
            'business_name' => 'required|string',
            'domain' => 'required|string',
        ]);

        $tenant = Tenant::create([
            'id' => $validated['id'],
            'business_name' => $validated['business_name'],
            'plan' => 'free'
        ]);

        $tenant->domains()->create(['domain' => $validated['domain'] . '.' . config('tenancy.central_domains')[0]]);

        return response()->json([
            'message' => 'Tenant created successfully',
            'tenant' => $tenant
        ], 201);
    }
}
