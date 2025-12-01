<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bulk_wallet_api_jobs', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('card_id')->nullable();

            // Job status fields
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->integer('total_items')->default(0);
            $table->integer('processed_items')->default(0);

            // Reason for failure or notes
            $table->text('reason')->nullable();

            $table->timestamps();

            // FKs
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->foreign('card_id')->references('id')->on('cards')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulk_wallet_api_jobs');
    }
};
