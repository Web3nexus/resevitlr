<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubscriptionController extends Controller
{
    /**
     * Get all available subscription plans.
     */
    public function getPlans()
    {
        return response()->json(SubscriptionPlan::where('is_active', true)->get());
    }

    /**
     * Get the current subscription status for the authenticated user's tenant.
     */
    public function currentStatus(Request $request)
    {
        $user = Auth::user();
        if (!$user->tenant_id) {
            return response()->json(['message' => 'No tenant associated with this user.'], 404);
        }

        $tenant = Tenant::find($user->tenant_id);
        $plan = SubscriptionPlan::where('slug', $tenant->plan)->first();

        $salesEmail = \App\Models\SaaSSetting::where('key', 'sales_email')->first()?->value ?? 'sales@resevit.com';

        return response()->json([
            'plan_name' => $plan ? $plan->name : 'Free',
            'plan_slug' => $tenant->plan,
            'status' => $tenant->subscription_status,
            'provider' => $tenant->subscription_provider,
            'ends_at' => $tenant->subscription_ends_at,
            'country' => $tenant->country,
            'sales_email' => $salesEmail,
        ]);
    }

    /**
     * Initialize a payment session.
     */
    public function subscribe(Request $request, PaymentService $paymentService)
    {
        $request->validate([
            'plan_slug' => 'required|exists:subscription_plans,slug',
            'interval' => 'required|in:monthly,yearly',
            'country' => 'nullable|string|size:2',
        ]);

        $user = Auth::user();
        $tenant = Tenant::find($user->tenant_id);

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        // Update country if provided
        if ($request->has('country')) {
            $tenant->country = strtoupper($request->country);
            $tenant->save();
        }

        $plan = SubscriptionPlan::where('slug', $request->plan_slug)->first();

        try {
            $paymentInfo = $paymentService->initializePayment($tenant, $plan, $request->interval);
            return response()->json($paymentInfo);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}
