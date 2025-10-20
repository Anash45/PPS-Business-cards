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
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->string('phone_text_color')->nullable()->after('btn_text_color');
            $table->string('phone_bg_color')->nullable()->after('phone_text_color');
            $table->string('email_text_color')->nullable()->after('phone_bg_color');
            $table->string('email_bg_color')->nullable()->after('email_text_color');
            $table->string('address_text_color')->nullable()->after('email_bg_color');
            $table->string('address_bg_color')->nullable()->after('address_text_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn([
                'phone_text_color',
                'phone_bg_color',
                'email_text_color',
                'email_bg_color',
                'address_text_color',
                'address_bg_color',
            ]);
        });
    }
};
