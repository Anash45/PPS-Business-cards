<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('card_social_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade'); // delete links if company is deleted

            $table->foreignId('card_id')
                ->nullable()
                ->constrained()
                ->onDelete('cascade'); // delete if card deleted

            $table->string('icon')->nullable(); // e.g. 'facebook', 'linkedin'
            $table->string('url');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('card_social_links');
    }
};