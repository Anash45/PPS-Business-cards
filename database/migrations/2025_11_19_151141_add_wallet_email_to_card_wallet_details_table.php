<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->string('wallet_email')->nullable()->after('user_image');
            // change "user_image" to the column you want to place it after
        });
    }

    public function down(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->dropColumn('wallet_email');
        });
    }
};
