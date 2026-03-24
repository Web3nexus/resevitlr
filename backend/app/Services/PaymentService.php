<?php

namespace App\Services;

use App\Models\SaaSSetting;
use App\Models\Tenant;
use App\Models\SubscriptionPlan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Get the appropriate payment gateway based on country and availability.
     */
    public static function getGateway(?string $country = null)
    {
        $country = strtoupper($country ?? 'US');
        
        $stripeEnabled = SaaSSetting::where('key', 'stripe_enabled')->first()?->value === 'true';
        $paystackEnabled = SaaSSetting::where('key', 'paystack_enabled')->first()?->value === 'true';
        $flutterwaveEnabled = SaaSSetting::where('key', 'flutterwave_enabled')->first()?->value === 'true';

        // Paystack is great for NG, GH, ZA, KE
        $paystackCountries = ['NG', 'GH', 'ZA', 'KE'];
        if ($paystackEnabled && in_array($country, $paystackCountries)) {
            return 'paystack';
        }

        // Flutterwave for rest of Africa or if specifically requested
        $africanCountries = ['EG', 'MA', 'CI', 'SN', 'UG', 'TZ', 'RW', 'CM'];
        if ($flutterwaveEnabled && in_array($country, $africanCountries)) {
            return 'flutterwave';
        }

        // Default to Stripe if enabled
        if ($stripeEnabled) {
            return 'stripe';
        }

        // Fallback to whatever is enabled if the primary choice isn't
        if ($paystackEnabled) return 'paystack';
        if ($flutterwaveEnabled) return 'flutterwave';

        return null;
    }

    /**
     * Initialize a checkout/subscription session.
     */
    public function initializePayment(Tenant $tenant, SubscriptionPlan $plan, string $interval = 'monthly')
    {
        $gateway = self::getGateway($tenant->country);
        $amount = $interval === 'yearly' ? $plan->yearly_price : $plan->monthly_price;
        $currency = SaaSSetting::where('key', 'default_currency')->first()?->value ?? 'USD';

        if (!$gateway) {
            throw new \Exception("No payment gateway available for this region.");
        }

        return match($gateway) {
            'stripe' => $this->initStripe($tenant, $plan, $amount, $currency, $interval),
            'paystack' => $this->initPaystack($tenant, $plan, $amount, $currency, $interval),
            'flutterwave' => $this->initFlutterwave($tenant, $plan, $amount, $currency, $interval),
            default => throw new \Exception("Unsupported gateway."),
        };
    }

    private function initStripe($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'stripe_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.stripe.com/v1/checkout/sessions', [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => strtolower($currency),
                    'product_data' => [
                        'name' => "{$plan->name} - Resevit Subscription",
                    ],
                    'unit_amount' => $amount * 100,
                    'recurring' => ['interval' => $interval === 'yearly' ? 'year' : 'month'],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'subscription',
            'success_url' => config('app.url') . "/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}",
            'cancel_url' => config('app.url') . "/dashboard/billing?canceled=true",
            'client_reference_id' => $tenant->id,
            'customer_email' => $tenant->data['email'] ?? null,
            'metadata' => [
                'plan_slug' => $plan->slug,
                'tenant_id' => $tenant->id,
                'interval'  => $interval
            ],
        ]);

        if ($response->failed()) {
            Log::error("Stripe Initialization Failed: " . $response->body());
            throw new \Exception("Failed to initialize Stripe payment.");
        }

        return [
            'url' => $response->json('url'),
            'provider' => 'stripe',
            'checkout_id' => $response->json('id')
        ];
    }

    private function initPaystack($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.paystack.co/transaction/initialize', [
            'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
            'amount' => $amount * 100, // Paystack uses kobo
            'currency' => $currency,
            'callback_url' => config('app.url') . "/dashboard/billing?vendor=paystack",
            'metadata' => [
                'tenant_id' => $tenant->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception("Paystack error: " . ($response->json('message') ?? 'Unknown error'));
        }

        return [
            'url' => $response->json('data.authorization_url'),
            'provider' => 'paystack',
            'reference' => $response->json('data.reference')
        ];
    }

    private function initFlutterwave($tenant, $plan, $amount, $currency, $interval)
    {
        $secretKey = SaaSSetting::where('key', 'flutterwave_secret_key')->first()?->value;
        
        $response = Http::withToken($secretKey)->post('https://api.flutterwave.com/v3/payments', [
            'tx_ref' => 'res_' . uniqid() . '_' . $tenant->id,
            'amount' => $amount,
            'currency' => $currency,
            'redirect_url' => config('app.url') . "/dashboard/billing?vendor=flutterwave",
            'payment_options' => 'card,account,ussd',
            'customer' => [
                'email' => $tenant->data['email'] ?? 'billing@' . $tenant->id . '.com',
                'name' => $tenant->business_name,
            ],
            'meta' => [
                'tenant_id' => $tenant->id,
                'plan_slug' => $plan->slug,
                'interval' => $interval
            ],
            'customizations' => [
                'title' => 'Resevit Subscription',
                'description' => $plan->name . " Plan",
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception("Flutterwave error: " . ($response->json('message') ?? 'Unknown error'));
        }

        return [
            'url' => $response->json('data.link'),
            'provider' => 'flutterwave',
            'tx_ref' => $response->json('data.tx_ref')
        ];
    }
}
