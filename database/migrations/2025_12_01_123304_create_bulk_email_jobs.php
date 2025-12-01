<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bulk_email_jobs', function (Blueprint $table) {
            $table->id();

            // Foreign Keys
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('card_id')->nullable();

            // Job fields
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->integer('total_items')->default(0);
            $table->integer('processed_items')->default(0);

            // New field for failure/notes
            $table->text('reason')->nullable();

            $table->timestamps();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->foreign('card_id')->references('id')->on('cards')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulk_email_jobs');
    }
};
