<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('company_card_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->json('order')->nullable(); // store ["phones", "emails", "websites", ...]
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_card_orders');
    }
};