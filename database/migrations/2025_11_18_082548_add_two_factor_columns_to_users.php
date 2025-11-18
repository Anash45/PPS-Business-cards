<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // For authenticator app (TOTP)
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();

            // For email 2FA
            $table->string('email_2fa_code')->nullable();
            $table->timestamp('email_2fa_expires_at')->nullable();

            // Which methods are enabled
            $table->boolean('is_email_2fa_enabled')->default(false);
            $table->boolean('is_totp_2fa_enabled')->default(false);
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_secret',
                'two_factor_recovery_codes',
                'email_2fa_code',
                'email_2fa_expires_at',
                'is_email_2fa_enabled',
                'is_totp_2fa_enabled',
            ]);
        });
    }

};
