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
                'features'          => [
                    'insights'          => true,
                    'reservations'      => true,
                    'pos_terminal'      => true,
                    'menu_builder'      => true,
                    'floor_plan'        => true,
                    'staff_profiles'    => true,
                    'billing_plan'      => true,
                    'configuration'     => true,
                    'provisioning'      => true,
                    'social_integration' => false,
                    'financial_reports' => false,
                    'ai_automation'     => false,
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
                'features'          => [
                    'insights'          => true,
                    'reservations'      => true,
                    'pos_terminal'      => true,
                    'menu_builder'      => true,
                    'floor_plan'        => true,
                    'staff_profiles'    => true,
                    'billing_plan'      => true,
                    'configuration'     => true,
                    'provisioning'      => true,
                    'social_integration' => true,
                    'financial_reports' => true,
                    'ai_automation'     => false,
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
                'features'          => [
                    'insights'          => true,
                    'reservations'      => true,
                    'pos_terminal'      => true,
                    'menu_builder'      => true,
                    'floor_plan'        => true,
                    'staff_profiles'    => true,
                    'billing_plan'      => true,
                    'configuration'     => true,
                    'provisioning'      => true,
                    'social_integration' => true,
                    'financial_reports' => true,
                    'ai_automation'     => true,
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
