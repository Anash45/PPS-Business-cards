<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nfc_cards', function (Blueprint $table) {
            $table->id();
            $table->string('qr_code')->unique();
            $table->foreignId('card_id')->nullable()->constrained('cards')->onDelete('set null');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedBigInteger('views')->default(0); // ✅ NEW COLUMN
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nfc_cards');
    }

};
