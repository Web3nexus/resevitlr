<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\SaaSSetting;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Webhook;
use Stripe\Exception\SignatureVerificationException;

class PaymentWebhookController extends Controller
{
    public function handleStripe(Request $request)
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        
        // Get webhook secret from SaaS settings
        $webhookSecret = SaaSSetting::where('key', 'stripe_webhook_secret')->value('value');

        if (!$webhookSecret) {
            Log::error("Stripe Webhook Secret not configured in SaaS settings.");
            return response()->json(['message' => 'Webhook secret missing'], 500);
        }

        try {
            // Verify and construct the event
            $event = Webhook::constructEvent(
                $payload, $sig_header, $webhookSecret
            );
            
            if ($event->type === 'checkout.session.completed') {
                $session = $event->data->object;
                $tenantId = $session->client_reference_id;
                $subscriptionId = $session->subscription;
                
                if ($tenantId) {
                    $this->updateTenantSubscription($tenantId, 'stripe', $subscriptionId);
                }
            }

            return response()->json(['status' => 'success']);
        } catch (\UnexpectedValueException $e) {
            // Invalid payload
            Log::error("Stripe Webhook Invalid Payload: " . $e->getMessage());
            return response()->json(['message' => 'Invalid payload'], 400);
        } catch (SignatureVerificationException $e) {
            // Invalid signature
            Log::error("Stripe Webhook Invalid Signature: " . $e->getMessage());
            return response()->json(['message' => 'Invalid signature'], 401);
        }
 catch (\Exception $e) {
            Log::error("Stripe Webhook Error: " . $e->getMessage());
            return response()->json(['message' => 'Webhook handling failed'], 400);
        }
    }

    public function handlePaystack(Request $request)
    {
        $secretKey = SaaSSetting::where('key', 'paystack_secret_key')->value('value');
        $signature = $request->header('x-paystack-signature');

        if (!$signature || $signature !== hash_hmac('sha512', $request->getContent(), $secretKey)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $event = $request->input('event');
        if ($event === 'charge.success') {
            $data = $request->input('data');
            $tenantId = $data['metadata']['tenant_id'] ?? null;
            $reference = $data['reference'];
            
            if ($tenantId) {
                $this->updateTenantSubscription($tenantId, 'paystack', $reference);
            }
        }

        return response()->json(['status' => 'success']);
    }

    public function handleFlutterwave(Request $request)
    {
        $secretHash = SaaSSetting::where('key', 'flutterwave_encryption_key')->value('value');
        $signature = $request->header('verif-hash');

        if ($secretHash && ($signature !== $secretHash)) {
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $status = $request->input('status');
        if ($status === 'successful') {
            $data = $request->input('data');
            $tenantId = $data['meta']['tenant_id'] ?? null;
            $txRef = $data['tx_ref'];
            
            if ($tenantId) {
                $this->updateTenantSubscription($tenantId, 'flutterwave', $txRef);
            }
        }

        return response()->json(['status' => 'success']);
    }

    private function updateTenantSubscription($tenantId, $provider, $subscriptionId)
    {
        $tenant = Tenant::find($tenantId);
        if ($tenant) {
            $tenant->subscription_id = $subscriptionId;
            $tenant->subscription_provider = $provider;
            $tenant->subscription_status = 'active';
            $tenant->subscription_ends_at = now()->addMonth(); // Simplified
            $tenant->save();
            
            Log::info("Tenant {$tenantId} subscription updated via {$provider}");
        }
    }
}
