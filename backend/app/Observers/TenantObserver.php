<?php

namespace App\Observers;

use App\Models\Tenant;
use App\Models\SubscriptionPlan;

class TenantObserver
{
    /**
     * Handle the Tenant "saving" event.
     * We use saving to catch both creating and updating.
     */
    public function saving(Tenant $tenant)
    {
        // If the plan is being changed (or set for the first time)
        if ($tenant->isDirty('plan') || !$tenant->exists) {
            $plan = SubscriptionPlan::where('slug', $tenant->plan)->first();
            
            if ($plan) {
                // Sync features from the plan if tenant features are null or if plan changed
                // We prioritize the plan's features to ensure manual DB updates work as expected.
                $tenant->features = $plan->features;
            }
        }
    }
}
