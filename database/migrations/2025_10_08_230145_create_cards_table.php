<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cards', function (Blueprint $table) {
            $table->id();
            $table->string('code', 8)->unique(); // 8-character code
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('cards_group_id')->constrained('cards_groups')->onDelete('cascade');
            $table->string('status', 10)->default('inactive');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cards');
    }
};