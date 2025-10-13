<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_phone_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('card_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('phone_number', 50);
            $table->string('text_color', 100)->nullable();
            $table->string('bg_color', 100)->nullable();
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_phone_numbers');
    }
};