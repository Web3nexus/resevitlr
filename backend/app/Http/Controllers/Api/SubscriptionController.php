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
     * Uses tenant() helper because Auth::user() in a tenant context has no central tenant_id.
     */
    public function currentStatus(Request $request)
    {
        // Get the active tenant from the tenancy context (set by domain middleware).
        $currentTenant = tenant();

        if (!$currentTenant) {
            return response()->json(['message' => 'Could not identify tenant context.'], 422);
        }

        // SubscriptionPlan lives in the central DB — query it there.
        $plan = tenancy()->central(fn() =>
            SubscriptionPlan::where('slug', $currentTenant->plan)->first()
        );

        $salesEmail = tenancy()->central(fn() =>
            \App\Models\SaaSSetting::where('key', 'sales_email')->value('value') ?? 'sales@resevit.com'
        );

        return response()->json([
            'plan_name'         => $plan ? $plan->name : 'Free',
            'plan_slug'         => $currentTenant->plan ?? 'free',
            'status'            => $currentTenant->subscription_status ?? 'active',
            'provider'          => $currentTenant->subscription_provider ?? null,
            'ends_at'           => $currentTenant->subscription_ends_at ?? null,
            'country'           => $currentTenant->country ?? null,
            'ai_credits_limit'  => $plan?->ai_credits_limit,          // null = Unlimited
            'ai_credits_used'   => $currentTenant->ai_credits_used ?? 0,
            'ai_credits_topup'  => $currentTenant->ai_credits_topup ?? 0,
            'sales_email'       => $salesEmail,
        ]);
    }

    /**
     * Initialize a payment session.
     */
    public function subscribe(Request $request, PaymentService $paymentService)
    {
        $request->validate([
            'plan_slug' => 'required|exists:subscription_plans,slug',
            'interval'  => 'required|in:monthly,yearly',
            'country'   => 'nullable|string|size:2',
        ]);

        // tenant() gives us the central Tenant model from the tenancy context.
        $currentTenant = tenant();

        if (!$currentTenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        // Update country if provided (stored on central Tenant model).
        if ($request->filled('country')) {
            $currentTenant->country = strtoupper($request->country);
            $currentTenant->save();
        }

        // SubscriptionPlan lives in the central DB.
        $plan = tenancy()->central(fn() =>
            SubscriptionPlan::where('slug', $request->plan_slug)->first()
        );

        try {
            $paymentInfo = $paymentService->initializePayment($currentTenant, $plan, $request->interval);
            return response()->json($paymentInfo);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    /**
     * Purchase additional AI credits (Top-up).
     */
    public function purchaseCredits(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
        ]);

        $currentTenant = tenant();

        if (!$currentTenant) {
            return response()->json(['message' => 'Tenant not found.'], 404);
        }

        // Logic here would normally involve a payment check
        $currentTenant->increment('ai_credits_topup', $request->amount);

        return response()->json([
            'message'          => "Successfully purchased {$request->amount} AI credits.",
            'ai_credits_topup' => $currentTenant->ai_credits_topup
        ]);
    }
}
