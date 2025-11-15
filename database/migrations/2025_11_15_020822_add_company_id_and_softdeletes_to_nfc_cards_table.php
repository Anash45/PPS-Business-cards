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
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->foreignId('company_id')
                ->nullable()
                ->after('card_id')
                ->constrained('companies')
                ->nullOnDelete(); // When company is deleted → set null

            $table->softDeletes(); // NFC card soft delete
        });
    }

    public function down(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn('company_id');
            $table->dropSoftDeletes();
        });
    }

};
