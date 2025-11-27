<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\TwoFactorController;
use App\Http\Controllers\Auth\TwoFactorLoginController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {
    // 2FA selection (choose method)

    Route::get('/2fa/select', [TwoFactorLoginController::class, 'select'])
        ->name('2fa.select');

    Route::post('/2fa/send', [TwoFactorLoginController::class, 'send'])->name('2fa.send');
    // Email 2FA challenge page
    Route::get('/2fa/email/challenge', [TwoFactorLoginController::class, 'show'])
        ->name('2fa.email.challenge');

    // Submit the 2FA code
    Route::post('/2fa/email/challenge', [TwoFactorLoginController::class, 'store'])
        ->name('2fa.email.challenge.post');

    // Resend code if expired
    Route::post('/2fa/email/resend', [TwoFactorLoginController::class, 'resend'])
        ->name('2fa.email.resend');

    // TOTP 2FA challenge page (login)
    Route::get('/2fa/totp/challenge', [TwoFactorLoginController::class, 'showTotpChallenge'])
        ->name('2fa.totp.challenge');

    // TOTP 2FA code submission
    Route::post('/2fa/totp/challenge', [TwoFactorLoginController::class, 'verifyTotpChallenge'])
        ->name('2fa.totp.challenge.post');



    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);

    Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');

    Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
        ->name('password.email');

    Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');
    Route::get('reset-password-link/', [NewPasswordController::class, 'createLinkSuccess'])
        ->name('password.resetLinkSuccess');

    Route::post('reset-password', [NewPasswordController::class, 'store'])
        ->name('password.store');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

Route::middleware('auth')->group(function () {

    // EMAIL 2FA
    Route::post('/two-factor/email/enable', [TwoFactorController::class, 'enableEmail']);
    Route::post('/two-factor/email/disable', [TwoFactorController::class, 'disableEmail']);

    // AUTHENTICATOR (TOTP)
    Route::post('/two-factor/totp/start', [TwoFactorController::class, 'startTotpSetup']);
    Route::post('/two-factor/totp/verify', [TwoFactorController::class, 'verifyTotp']);
    Route::post('/two-factor/totp/disable', [TwoFactorController::class, 'disableTotp']);
    Route::post('/two-factor/interval', [TwoFactorController::class, 'updateInterval']);
});