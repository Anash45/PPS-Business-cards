<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->string('vcard_btn_text_color')->nullable()->after('address_bg_color');
            $table->string('vcard_btn_bg_color')->nullable()->after('vcard_btn_text_color');
        });
    }

    public function down(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn(['vcard_btn_text_color', 'vcard_btn_bg_color']);
        });
    }
};
