<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->string('website_text_color', 20)->nullable()->after('address_bg_color');
            $table->string('website_bg_color', 20)->nullable()->after('website_text_color');
        });
    }

    public function down(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn(['website_text_color', 'website_bg_color']);
        });
    }
};