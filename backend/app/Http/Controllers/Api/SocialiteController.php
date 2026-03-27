<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SocialiteController extends Controller
{
    /**
     * Redirect to Meta for Authentication.
     */
    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')
            ->scopes([
                'pages_manage_metadata',
                'pages_messaging',
                'instagram_manage_messages',
                'whatsapp_business_management',
                'whatsapp_business_messaging'
            ])
            ->stateless()
            ->redirect();
    }

    /**
     * Handle the callback from Meta.
     */
    public function handleFacebookCallback(Request $request)
    {
        try {
            $user = Socialite::driver('facebook')->stateless()->user();
            $token = $user->token;

            // 1. Exchange for a Long-Lived Token (60 days)
            $response = Http::get('https://graph.facebook.com/v17.0/oauth/access_token', [
                'grant_type' => 'fb_exchange_token',
                'client_id' => config('services.facebook.client_id'),
                'client_secret' => config('services.facebook.client_secret'),
                'fb_exchange_token' => $token,
            ]);

            $longLivedToken = $response->json()['access_token'] ?? $token;

            // 2. Fetch User's Pages to find the messaging page
            $pagesResponse = Http::get('https://graph.facebook.com/v17.0/me/accounts', [
                'access_token' => $longLivedToken,
            ]);
            
            $pages = $pagesResponse->json()['data'] ?? [];
            $firstPage = $pages[0] ?? null;

            // 3. Update the Current Tenant (If in tenant context)
            if (tenant()) {
                $tenant = tenant();
                if ($firstPage) {
                    $tenant->facebook_page_id = $firstPage['id'];
                    $tenant->facebook_page_token = $firstPage['access_token']; // Note: Page tokens from a long-lived user token are permanent
                }
                $tenant->meta_user_token = $longLivedToken;
                $tenant->save();
            }

            // Redirect back to the frontend settings page
            $redirectUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard/settings?oauth=success';
            return redirect($redirectUrl);

        } catch (\Exception $e) {
            Log::error('Meta OAuth Callback Failed', ['error' => $e->getMessage()]);
            $errorUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard/settings?oauth=error';
            return redirect($errorUrl);
        }
    }
}
