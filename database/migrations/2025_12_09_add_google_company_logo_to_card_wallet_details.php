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
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->string('google_company_logo')->nullable()->after('user_image_string');
            $table->string('google_company_logo_string')->nullable()->after('google_company_logo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->dropColumn(['google_company_logo', 'google_company_logo_string']);
        });
    }
};
