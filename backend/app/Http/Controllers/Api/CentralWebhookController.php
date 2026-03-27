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
        Log::info('Incoming Meta Webhook', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'payload' => $payload
        ]);

        // 1. Collect all potential identifiers from the payload
        $potentialIds = [];
        
        // WhatsApp Business Payload
        if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
            $platform = 'WhatsApp';
            $potentialIds[] = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
            if (isset($payload['entry'][0]['id'])) $potentialIds[] = $payload['entry'][0]['id'];
            if (isset($payload['entry'][0]['changes'][0]['value']['metadata']['display_phone_number'])) {
                $potentialIds[] = $payload['entry'][0]['changes'][0]['value']['metadata']['display_phone_number'];
            }
        } 
        // Facebook/Instagram Page Payload
        elseif (isset($payload['entry'][0]['id'])) {
            $platform = (isset($payload['object']) && $payload['object'] === 'instagram') ? 'Instagram' : 'Facebook';
            $potentialIds[] = $payload['entry'][0]['id'];
        }
        // Fallback for custom/simulated payloads
        elseif (isset($payload['message']['platform_id'])) {
            $platform = $payload['message']['platform'] ?? 'Web';
            $potentialIds[] = $payload['message']['platform_id'];
        }

        $platformId = $potentialIds[0] ?? 'unknown';

        // 2. Perform Robust/Fuzzy matching against Tenants
        $tenant = Tenant::all()->first(function ($t) use ($potentialIds) {
            $storedIds = [
                $t->whatsapp_id,
                $t->facebook_page_id,
                $t->instagram_id
            ];

            foreach ($potentialIds as $incomingId) {
                foreach ($storedIds as $storedId) {
                    if (empty($storedId) || empty($incomingId)) continue;
                    
                    // Exact match
                    if ($storedId == $incomingId) return true;
                    
                    // Numeric normalization match (strip +, -, spaces)
                    $normIncoming = preg_replace('/\D/', '', (string)$incomingId);
                    $normStored = preg_replace('/\D/', '', (string)$storedId);
                    
                    if (!empty($normIncoming) && !empty($normStored)) {
                        if ($normIncoming === $normStored) return true;
                        
                        // Last 10 digits match (handles international prefix variations)
                        if (strlen($normIncoming) >= 10 && strlen($normStored) >= 10) {
                            if (substr($normIncoming, -10) === substr($normStored, -10)) return true;
                        }
                    }

                    // Partial match for URLs (case insensitive)
                    if (stripos((string)$storedId, (string)$incomingId) !== false) return true;
                }
            }
            return false;
        });

        if (!$tenant) {
            // TEMPORARY CATCH-ALL FOR DEBUGGING (Force to vincentv if unsure)
            $tenant = Tenant::find('vincentv'); 
            Log::info('Social Webhook: NO MATCH - Using Catch-All (vincentv)', ['platformId' => $platformId]);
        }

        if (!$tenant) {
            Log::warning('Social Webhook: No tenant found for ID ' . $platformId);
            return response()->json(['status' => 'ignored', 'message' => 'No matching tenant found'], 200);
        }

        // 3. Initialize Tenancy and hand off to the tenant's controller
        try {
            tenancy()->initialize($tenant);
            
            // Auto-update technical IDs for non-technical users
            if ($platform === 'WhatsApp' && isset($payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'])) {
                $technicalId = $payload['entry'][0]['changes'][0]['value']['metadata']['phone_number_id'];
                if ($tenant->whatsapp_technical_id !== $technicalId) {
                    $tenant->whatsapp_technical_id = $technicalId;
                    $tenant->save();
                }
            }
            
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
