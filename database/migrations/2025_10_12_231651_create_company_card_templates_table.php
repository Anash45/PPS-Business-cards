<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_card_templates', function (Blueprint $table) {
            $table->id();

            // Relation to company
            $table->foreignId('company_id')
                ->constrained()
                ->onDelete('cascade'); // Delete template if company deleted

            // Template fields
            $table->string('banner_image')->nullable();
            $table->string('company_name')->nullable();
            $table->string('card_bg_color', 100)->nullable();
            $table->string('name_text_color', 100)->nullable();
            $table->string('company_text_color', 100)->nullable();
            $table->string('btn_bg_color', 100)->nullable();
            $table->string('btn_text_color', 100)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_card_templates');
    }
};
