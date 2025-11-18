<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\TwoFactorCodeMail;
use Auth;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Log;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorLoginController extends Controller
{
    public function select(Request $request)
    {
        $userId = $request->session()->get('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        return inertia('Auth/TwoFactorSelect', ['user' => $user]);
    }


    /**
     * Handle sending the selected 2FA method.
     */
    public function send(Request $request)
    {
        $request->validate([
            'method' => 'required|in:email,totp', // TOTP optional for now
        ]);

        $selectedMethod = $request->input('method');

        // Get the temporary user ID from session
        $userId = session('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login')
                ->withErrors(['email' => 'Session expired. Please login again.']);
        }

        $user = User::findOrFail($userId);

        if ($selectedMethod === 'email') {
            $code = random_int(100000, 999999);

            $user->email_2fa_code = $code;
            $user->email_2fa_expires_at = now()->addMinutes(10);
            $user->save();

            try {
                Mail::to($user->email)->send(new TwoFactorCodeMail($code));

            } catch (\Exception $e) {

                return back()->withErrors([
                    'email' => 'Failed to send 2FA email. Please try again later.'
                ]);
            }

            return redirect()->route('2fa.email.challenge');
        }

        if ($selectedMethod === 'totp') {
            // No new QR or secret needed
            return redirect()->route('2fa.totp.challenge'); // You can create a TOTP challenge page
        }


        // For now, TOTP is not implemented
        return back()->withErrors(['method' => 'Authenticator app (TOTP) not implemented yet.']);
    }

    public function showTotpChallenge()
    {
        $userId = session('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please login again.'
            ]);
        }

        $user = User::findOrFail($userId);

        return inertia('Auth/TotpChallenge', [
            'user' => $user,
        ]);
    }

    public function verifyTotpChallenge(Request $request)
    {
        $request->validate([
            'code' => 'required|digits:6',
        ]);

        $userId = $request->session()->get('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login')->withErrors([
                'email' => 'Session expired. Please login again.'
            ]);
        }

        $user = User::findOrFail($userId);

        $google2fa = new Google2FA();
        $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);

        if (!$valid) {
            return back()->withErrors([
                'code' => 'Invalid code. Please try again.'
            ]);
        }

        // Clear 2FA session and log in
        $request->session()->forget('2fa:user:id');
        Auth::login($user, true);

        // Redirect based on user type
        if ($user->isEditor())
            return redirect()->route('company.cards');
        if ($user->isAdmin() || $user->isCompany())
            return redirect()->route('dashboard');
        return redirect()->route('profile.edit');
    }


    // Show the email 2FA form
    public function show(Request $request)
    {
        $userId = session('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login')->withErrors(['email' => 'Session expired. Please login again.']);
        }

        return inertia('Auth/EmailTwoFactorChallenge');
    }

    // Handle form submission
    public function store(Request $request)
    {
        // Validate the input
        $request->validate([
            'code' => 'required|digits:6',
        ]);

        // Get the temporary user ID from session
        $userId = session('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login')
                ->withErrors(['email' => 'Session expired. Please login again.']);
        }

        $user = User::findOrFail($userId);

        $enteredCode = $request->input('code');

        // Check if code is expired first
        if (now()->greaterThan($user->email_2fa_expires_at)) {
            return back()->withErrors(['code' => 'The 2FA code has expired. Please request a new one.']);
        }

        Log::info("User: ", ['User 2fa' => $user->email_2fa_code, 'Entered 2fa' => $enteredCode]);

        // Then check if code matches
        if ($user->email_2fa_code !== $enteredCode) {
            return back()->withErrors(['code' => 'The 2FA code you entered is invalid.']);
        }

        // Clear 2FA session and code
        session()->forget('2fa:user:id');
        $user->email_2fa_code = null;
        $user->email_2fa_expires_at = null;
        $user->save();

        // Log in the user
        Auth::login($user, true);

        // Redirect based on role
        if ($user->isEditor()) {
            return redirect()->route('company.cards');
        }
        if ($user->isAdmin() || $user->isCompany()) {
            return redirect()->route('dashboard');
        }

        return redirect()->route('profile.edit');
    }

    // Resend code
    public function resend(Request $request)
    {
        $userId = session('2fa:user:id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($userId);

        $code = random_int(100000, 999999);
        $user->email_2fa_code = $code;
        $user->email_2fa_expires_at = now()->addMinutes(10);
        $user->save();

        try {
            Mail::to($user->email)->send(new TwoFactorCodeMail($code));
        } catch (\Exception $e) {
            return back()->withErrors([
                'email' => 'Failed to send 2FA email. Please try again later.'
            ]);
        }

        return back()->with('status', 'A new code has been sent to your email.');
    }
}
