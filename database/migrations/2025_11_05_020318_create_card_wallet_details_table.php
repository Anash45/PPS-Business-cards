<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('card_wallet_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('card_id')->constrained('cards')->onDelete('cascade');
            $table->string('template_id', 20);
            $table->string('company_logo')->nullable();
            $table->string('user_image')->nullable();
            $table->longText('company_logo_string')->nullable();
            $table->longText('user_image_string')->nullable();
            $table->string('bg_color')->nullable();
            $table->string('text_color')->nullable();
            $table->string('card_code')->nullable();
            $table->string('qr_caption')->nullable();
            $table->string('label_1')->nullable();
            $table->string('label_1_value')->nullable();
            $table->string('label_2')->nullable();
            $table->string('label_2_value')->nullable();
            $table->string('label_3')->nullable();
            $table->string('label_3_value')->nullable();
            $table->string('wallet_title')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_wallet_details');
    }
};