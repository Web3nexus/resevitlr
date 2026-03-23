<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'              => 'Free',
                'slug'              => 'free',
                'monthly_price'     => 0,
                'yearly_price'      => 0,
                'reservation_limit' => 50,
                'max_staff'         => 2,
                'ai_credits_limit'  => 10,
                'features'          => [
                    'insights'          => true,
                    'reservations'      => true,
                    'configuration'     => true,
                    'provisioning'      => true,
                    'billing_plan'      => true,
                    // Gated 9 (All false for Free)
                    'social_integration' => false,
                    'pos_terminal'      => false,
                    'menu_builder'      => false,
                    'floor_plan'        => false,
                    'staff_management'  => false,
                    'financial_reports' => false,
                    'ai_automation'     => false,
                    'online_ordering'   => false,
                    'inventory_tracking' => false,
                ],
                'is_active' => true,
            ],
            [
                'name'              => 'Pro',
                'slug'              => 'pro',
                'monthly_price'     => 49,
                'yearly_price'      => 470,
                'reservation_limit' => 500,
                'max_staff'         => 10,
                'ai_credits_limit'  => 1000,
                'features'          => [
                    'insights'          => true,
                    'reservations'      => true,
                    'configuration'     => true,
                    'provisioning'      => true,
                    'billing_plan'      => true,
                    // Gated 9 (Some true for Pro)
                    'social_integration' => true,
                    'pos_terminal'      => true,
                    'menu_builder'      => true,
                    'floor_plan'        => true,
                    'staff_management'  => true,
                    'financial_reports' => true,
                    'ai_automation'     => false,
                    'online_ordering'   => true,
                    'inventory_tracking' => false,
                ],
                'is_active' => true,
            ],
            [
                'name'              => 'Enterprise',
                'slug'              => 'enterprise',
                'monthly_price'     => 149,
                'yearly_price'      => 1430,
                'reservation_limit' => null,
                'max_staff'         => null,
                'ai_credits_limit'  => 5000,
                'features'          => [
                    'insights'          => true,
                    'reservations'      => true,
                    'configuration'     => true,
                    'provisioning'      => true,
                    'billing_plan'      => true,
                    // Gated 9 (All true for Enterprise)
                    'social_integration' => true,
                    'pos_terminal'      => true,
                    'menu_builder'      => true,
                    'floor_plan'        => true,
                    'staff_management'  => true,
                    'financial_reports' => true,
                    'ai_automation'     => true,
                    'online_ordering'   => true,
                    'inventory_tracking' => true,
                ],
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
