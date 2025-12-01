<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bulk_wallet_api_job_items', function (Blueprint $table) {
            $table->id();

            // FK to parent job
            $table->unsignedBigInteger('bulk_wallet_api_job_id');

            // Additional FKs
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('card_id')->nullable();

            // Item-specific fields
            $table->string('status')->default('pending'); // pending, synced, failed
            $table->text('reason')->nullable(); // API error, validation issue, etc.

            $table->timestamps();

            // Foreign Keys
            $table->foreign('bulk_wallet_api_job_id')
                ->references('id')
                ->on('bulk_wallet_api_jobs')
                ->onDelete('cascade');

            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->onDelete('set null');

            $table->foreign('card_id')
                ->references('id')
                ->on('cards')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulk_wallet_api_job_items');
    }
};
