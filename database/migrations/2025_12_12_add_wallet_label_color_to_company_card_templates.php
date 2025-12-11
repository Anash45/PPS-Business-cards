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
            $table->string('wallet_label_color')->nullable()->after('wallet_text_color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn('wallet_label_color');
        });
    }
};
