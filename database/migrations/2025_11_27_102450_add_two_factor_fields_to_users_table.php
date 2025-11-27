<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('two_factor_prompt_interval')
                ->nullable()
                ->comment('How often 2FA is required on same device: daily, weekly, 15_days');

            $table->timestamp('two_factor_last_verified_at')
                ->nullable()
                ->comment('Last time email/TOTP 2FA was successfully verified on this device');

            $table->string('two_factor_device_hash')
                ->nullable()
                ->comment('Hashed identifier of the device where 2FA was last verified');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'two_factor_prompt_interval',
                'two_factor_last_verified_at',
                'two_factor_device_hash',
            ]);
        });
    }
};
