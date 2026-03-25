<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CentralWebhookController extends Controller
{
    /**
     * Handle Meta (WhatsApp/Facebook) Webhook Verification.
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        // Fetch global verify token from SaaS settings
        $settings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        $expectedToken = $settings['social_verify_token'] ?? 'resevit_secret_token';

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === $expectedToken) {
                return response($challenge, 200);
            }
        }

        return response('Forbidden', 403);
    }

    /**
     * Handle incoming webhooks from WhatsApp, Facebook, Instagram.
     * This runs in the CENTRAL context (no tenancy initialized yet).
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        Log::info('Central Social Webhook Received', ['payload' => $payload]);

        // 1. Identify the platform and the platform-specific ID
        $platform = 'Web';
        $platformId = null;
        $tenant = null;

        // WhatsApp Business Payload
        if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
            $platform = 'WhatsApp';
            $phoneNumberId = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
            $wabaId = $payload['entry'][0]['id'] ?? null;
            $displayPhoneNumber = $payload['entry'][0]['changes'][0]['value']['metadata']['display_phone_number'] ?? null;
            
            $platformId = $phoneNumberId; // keep for logging

            // Try to match tenant against any of the possible WhatsApp identifiers user might have entered
            $tenant = Tenant::where('data->whatsapp_id', $phoneNumberId)
                ->when($wabaId, function($q) use ($wabaId) {
                    $q->orWhere('data->whatsapp_id', $wabaId);
                })
                ->when($displayPhoneNumber, function($q) use ($displayPhoneNumber) {
                    // sometimes display numbers have '+' and sometimes they don't, check exact and without +
                    $q->orWhere('data->whatsapp_id', $displayPhoneNumber)
                      ->orWhere('data->whatsapp_id', str_replace('+', '', $displayPhoneNumber))
                      ->orWhere('data->whatsapp_id', '+' . str_replace('+', '', $displayPhoneNumber));
                })
                ->first();
        } 
        // Facebook/Instagram Page Payload
        elseif (isset($payload['entry'][0]['id'])) {
            $platformId = $payload['entry'][0]['id'];
            $platform = (isset($payload['object']) && $payload['object'] === 'instagram') ? 'Instagram' : 'Facebook';
            
            $tenant = Tenant::where('data->facebook_page_id', $platformId)
                ->orWhere('data->instagram_id', $platformId)
                // Just in case they pasted the ID in the wrong social box
                ->orWhere('data->whatsapp_id', $platformId)
                // Handle cases where user might have pasted a URL containing the ID
                ->orWhere('data->facebook_page_id', 'LIKE', '%' . $platformId . '%')
                ->orWhere('data->instagram_id', 'LIKE', '%' . $platformId . '%')
                ->first();
        }
        // Fallback for custom/simulated payloads
        elseif (isset($payload['message']['platform_id'])) {
            $platformId = $payload['message']['platform_id'];
            $platform = $payload['message']['platform'] ?? 'Web';
            
            $tenant = Tenant::where('data->whatsapp_id', $platformId)
                ->orWhere('data->facebook_page_id', $platformId)
                ->orWhere('data->instagram_id', $platformId)
                ->first();
        }

        if (!$tenant) {
            Log::warning('Social Webhook: No tenant found for ID ' . $platformId);
            return response()->json(['status' => 'ignored', 'message' => 'No matching tenant found'], 200);
        }

        // 3. Initialize Tenancy and hand off to the tenant's controller
        try {
            tenancy()->initialize($tenant);
            
            // We can directly call the existing AutomationController@handleSocialWebhook
            // OR we can manually trigger the logic here while in tenant context.
            $controller = new \App\Http\Controllers\Api\AutomationController();
            $response = $controller->handleSocialWebhook($request);
            
            tenancy()->end();
            return $response;
        } catch (\Exception $e) {
            Log::error('Central Webhook Handoff Failed', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Internal processing error'], 500);
        }
    }
}
