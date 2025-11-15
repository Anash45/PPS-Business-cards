<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('company_api_tokens', function (Blueprint $table) {
            $table->id();

            // Foreign key to companies table
            $table->foreignId('company_id')
                ->constrained('companies')
                ->cascadeOnDelete();

            // Token string, unique
            $table->string('token', 255)->unique();

            // Optional: track last usage
            $table->timestamp('last_used_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_api_tokens');
    }
};