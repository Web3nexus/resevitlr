<?php

namespace App\Http\Controllers\Api;

class ProfileController extends \App\Http\Controllers\Controller
{
    /**
     * Get the current user profile.
     */
    public function index(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $data = $user->toArray();
        if ($user instanceof \App\Models\Admin) {
            $data['role'] = 'admin';
        } else {
            $data['role'] = $user->roles->first()?->name ?? 'waitstaff';
        }
        return response()->json($data);
    }

    /**
     * Update the user profile.
     */
    public function update(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        $data = $user->toArray();
        if ($user instanceof \App\Models\Admin) {
            $data['role'] = 'admin';
        } else {
            $rawRole = $user->roles->first()?->name ?? 'waitstaff';
            $data['role'] = ($rawRole === 'restaurant_owner') ? 'owner' : $rawRole;
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $data
        ]);
    }

    /**
     * Update the user password.
     */
    public function updatePassword(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $request->user()->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Get active sessions (tokens) for the current user.
     */
    public function getSessions(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $sessions = $user->tokens()->orderBy('last_used_at', 'desc')->get()->map(function ($token) use ($currentTokenId) {
            return [
                'id'           => $token->id,
                'device'       => $token->name,
                'location'     => 'Unknown Location', // Sanctum doesn't store this by default
                'last_active'  => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never',
                'is_current'   => $token->id === $currentTokenId,
            ];
        });

        return response()->json($sessions);
    }

    /**
     * Revoke a specific session.
     */
    public function revokeSession(\Illuminate\Http\Request $request, $id)
    {
        $user = $request->user();
        $token = $user->tokens()->where('id', $id)->first();

        if (!$token) {
            return response()->json(['message' => 'Session not found'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'Session revoked successfully']);
    }

    /**
     * Update 2FA Method preference.
     */
    public function update2faMethod(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'method' => 'required|in:none,email,totp,pin',
        ]);

        $user = $request->user();

        if ($request->method === 'totp' && !$user->two_factor_secret) {
            return response()->json(['message' => 'Please set up an authenticator app first.'], 400);
        }

        if ($request->method === 'pin' && !$user->login_pin) {
            return response()->json(['message' => 'Please set a PIN first.'], 400);
        }

        $user->update(['two_factor_method' => $request->method]);

        return response()->json(['message' => '2FA method updated successfully.']);
    }

    /**
     * Generate Google Auth TOTP Secret and QR Code.
     */
    public function generateTotpSecret(\Illuminate\Http\Request $request)
    {
        $user = $request->user();
        $google2fa = new \PragmaRX\Google2FA\Google2FA();

        $secret = $google2fa->generateSecretKey();
        
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name', 'Resevit'),
            $user->email,
            $secret
        );
        
        $writer = new \BaconQrCode\Writer(new \BaconQrCode\Renderer\ImageRenderer(
            new \BaconQrCode\Renderer\RendererStyle\RendererStyle(200),
            new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
        ));
        
        $qrImage = base64_encode($writer->writeString($qrCodeUrl));

        return response()->json([
            'secret' => $secret,
            'qr_code' => 'data:image/svg+xml;base64,'.$qrImage
        ]);
    }

    /**
     * Verify initial TOTP code to save secret.
     */
    public function verifyTotp(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'secret' => 'required|string',
            'code'   => 'required|string',
        ]);

        $user = $request->user();
        $google2fa = new \PragmaRX\Google2FA\Google2FA();

        $valid = $google2fa->verifyKey($request->secret, $request->code);

        if ($valid) {
            $user->update([
                'two_factor_secret' => $request->secret,
                'two_factor_method' => 'totp'
            ]);
            return response()->json(['message' => 'Authenticator app enabled successfully.']);
        }

        return response()->json(['message' => 'Invalid verification code.'], 400);
    }

    /**
     * Set Login PIN.
     */
    public function setPin(\Illuminate\Http\Request $request)
    {
        $request->validate([
            'pin' => 'required|string|size:6|confirmed',
        ]);

        $user = $request->user();
        $user->update([
            'login_pin' => \Illuminate\Support\Facades\Hash::make($request->pin),
            'two_factor_method' => 'pin'
        ]);

        return response()->json(['message' => 'PIN set successfully.']);
    }
}
