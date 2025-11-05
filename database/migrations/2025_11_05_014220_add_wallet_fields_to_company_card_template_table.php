<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->string('wallet_text_color')->nullable();
            $table->string('wallet_bg_color')->nullable();
            $table->string('wallet_title')->nullable();
            $table->string('wallet_label_1')->nullable();
            $table->string('wallet_label_2')->nullable();
            $table->string('wallet_label_3')->nullable();
            $table->string('wallet_qr_caption')->nullable();
            $table->string('wallet_logo_image')->nullable(); // path for image
        });
    }

    public function down(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn([
                'wallet_text_color',
                'wallet_bg_color',
                'wallet_title',
                'wallet_label_1',
                'wallet_label_2',
                'wallet_label_3',
                'wallet_qr_caption',
                'wallet_logo_image',
            ]);
        });
    }
};
