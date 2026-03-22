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

        // WhatsApp Business Payload
        if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
            $platform = 'WhatsApp';
            $platformId = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
        } 
        // Facebook/Instagram Page Payload
        elseif (isset($payload['entry'][0]['id'])) {
            $platformId = $payload['entry'][0]['id'];
            // Distinguish between FB and IG if possible from payload
            $platform = isset($payload['entry'][0]['messaging']) ? 'Facebook' : 'Instagram';
        }
        // Fallback for custom/simulated payloads
        elseif (isset($payload['message']['platform_id'])) {
            $platformId = $payload['message']['platform_id'];
            $platform = $payload['message']['platform'] ?? 'Web';
        }

        if (!$platformId) {
            return response()->json(['status' => 'error', 'message' => 'Platform ID not found in payload'], 400);
        }

        // 2. Find the tenant associated with this platform ID
        // Note: Stancl Tenancy stores custom data in the 'data' JSON column
        $tenant = Tenant::where('data->whatsapp_id', $platformId)
            ->orWhere('data->facebook_page_id', $platformId)
            ->orWhere('data->instagram_id', $platformId)
            ->first();

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
