<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bulk_email_job_items', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->unsignedBigInteger('bulk_email_job_id');
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('card_id')->nullable();

            // Item fields
            $table->string('email')->nullable();
            $table->string('status')->default('pending'); // pending, sent, failed, skipped, etc.

            // Reason field added here too
            $table->text('reason')->nullable();

            $table->timestamps();

            // FKs
            $table->foreign('bulk_email_job_id')->references('id')->on('bulk_email_jobs')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->foreign('card_id')->references('id')->on('cards')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulk_email_job_items');
    }
};
