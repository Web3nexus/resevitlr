<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocialMessengerService
{
    /**
     * Send a message to a social platform (WhatsApp/Facebook).
     */
    public function sendMessage(string $platform, string $recipientId, string $message, array $metadata = [])
    {
        // 1. Fetch Global Meta Token from SaaS Settings
        $saasSettings = \App\Models\SaaSSetting::all()->pluck('value', 'key');
        $token = $saasSettings['meta_system_token'] ?? env('META_SYSTEM_TOKEN');

        if (empty($token)) {
            Log::warning("Skipping social dispatch: No META_SYSTEM_TOKEN configured.");
            return false;
        }

        try {
            if ($platform === 'WhatsApp') {
                return $this->sendWhatsApp($recipientId, $message, $metadata['phone_number_id'] ?? null, $token);
            } elseif ($platform === 'Facebook' || $platform === 'Instagram') {
                return $this->sendFacebook($recipientId, $message, $token);
            }
        } catch (\Exception $e) {
            Log::error("Social Dispatch Failed", ['platform' => $platform, 'error' => $e->getMessage()]);
        }

        return false;
    }

    /**
     * Dispatch to WhatsApp Cloud API.
     */
    private function sendWhatsApp($recipientId, $message, $phoneNumberId, $token)
    {
        if (!$phoneNumberId) {
            Log::warning("WhatsApp Dispatch Missing phone_number_id");
            return false;
        }

        $url = "https://graph.facebook.com/v17.0/{$phoneNumberId}/messages";
        
        $response = Http::withToken($token)->post($url, [
            'messaging_product' => 'whatsapp',
            'recipient_type' => 'individual',
            'to' => $recipientId,
            'type' => 'text',
            'text' => ['body' => $message],
        ]);

        if ($response->successful()) {
            return true;
        }

        Log::error("WhatsApp API Error", ['response' => $response->json(), 'url' => $url]);
        return false;
    }

    /**
     * Dispatch to Facebook Messenger API.
     */
    private function sendFacebook($recipientId, $message, $token)
    {
        // For FB, we often need a Page Access Token.
        // If meta_system_token is a System Admin token, it might work for multiple pages 
        // if the app has appropriate permissions.
        $url = "https://graph.facebook.com/v17.0/me/messages";

        $response = Http::withToken($token)->post($url, [
            'recipient' => ['id' => $recipientId],
            'message' => ['text' => $message],
        ]);

        if ($response->successful()) {
            return true;
        }

        Log::error("Facebook API Error", ['response' => $response->json()]);
        return false;
    }
}
