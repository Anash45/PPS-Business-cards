<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use PragmaRX\Google2FA\Google2FA;
use BaconQrCode\Writer;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;

class TwoFactorController extends Controller
{
    /**
     * ENABLE EMAIL 2FA
     */
    public function enableEmail(Request $request)
    {
        $user = Auth::user();

        $user->is_email_2fa_enabled = true;
        $user->save();


        return response()->json([
            'message' => 'Email 2FA has been enabled. A code has been sent to your email.',
        ]);
    }

    /**
     * DISABLE EMAIL 2FA
     */
    public function disableEmail(Request $request)
    {
        $user = Auth::user();

        $user->is_email_2fa_enabled = false;
        $user->email_2fa_code = null;
        $user->email_2fa_expires_at = null;
        $user->save();

        return response()->json([
            'message' => 'Email 2FA disabled.',
        ]);
    }

    /**
     * START TOTP SETUP
     */
    public function startTotpSetup()
    {
        $google2fa = new Google2FA();
        $user = Auth::user();

        // Generate secret key
        $secret = $google2fa->generateSecretKey();
        $user->two_factor_secret = $secret; // Updated DB column
        $user->save();

        // Generate QR code URL
        $qrData = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        $svg = $writer->writeString($qrData);

        // Return JSON with base64 QR code
        return response()->json([
            'status' => 'success',
            'message' => 'Scan the QR code using Google or Microsoft Authenticator.',
            'totp_qr' => 'data:image/svg+xml;base64,' . base64_encode($svg),
            'secret' => $secret, // optional
        ]);
    }


    /**
     * CONFIRM TOTP CODE
     */
    public function verifyTotp(Request $request)
    {
        $request->validate([
            'code' => 'required|digits:6',
        ]);

        $user = $request->user(); // Use request to get authenticated user
        $google2fa = new Google2FA();

        if (!$user->two_factor_secret) {
            return response()->json([
                'status' => 'error',
                'message' => 'TOTP secret not found. Start setup first.',
            ], 422);
        }

        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->input('code'));

        if (!$valid) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid code, please try again.',
            ], 422);
        }

        $user->is_totp_2fa_enabled = true;
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Authenticator App 2FA has been successfully enabled.',
        ]);
    }

    /**
     * DISABLE TOTP 2FA
     */
    public function disableTotp()
    {
        $user = Auth::user();

        $user->is_totp_2fa_enabled = false;
        $user->two_factor_secret = null;
        $user->save();

        return response()->json([
            'message' => 'Authenticator 2FA disabled.',
        ]);
    }
}
