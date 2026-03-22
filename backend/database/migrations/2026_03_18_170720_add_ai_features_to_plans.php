<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\SubscriptionPlan;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update Pro Plan
        $pro = SubscriptionPlan::where('slug', 'pro')->first();
        if ($pro) {
            $pro->update([
                'features' => ['basic_ordering', 'menu_management', 'financial_reports', 'ai_automation', 'social_integration']
            ]);
        }

        // Update Enterprise Plan
        $ent = SubscriptionPlan::where('slug', 'enterprise')->first();
        if ($ent) {
            $ent->update([
                'features' => ['basic_ordering', 'menu_management', 'financial_reports', 'ai_automation', 'social_integration', 'priority_support', 'custom_branding']
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
