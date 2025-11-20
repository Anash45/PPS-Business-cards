<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            // Add new column
            $table->string('card_code')->nullable()->after('card_id');
        });

        // Copy card.code → nfc_cards.card_code
        DB::table('nfc_cards')
            ->join('cards', 'nfc_cards.card_id', '=', 'cards.id')
            ->update([
                    'nfc_cards.card_code' => DB::raw('cards.code')
                ]);

        Schema::table('nfc_cards', function (Blueprint $table) {
            // Drop the old card_id FK + column
            $table->dropForeign(['card_id']);
            $table->dropColumn('card_id');

            // Index for faster lookup
            $table->index('card_code');
        });
    }

    public function down(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            // Recreate card_id column
            $table->unsignedBigInteger('card_id')->nullable()->after('card_code');
        });

        // Restore card_id using card_code (reverse mapping)
        DB::table('nfc_cards')
            ->join('cards', 'nfc_cards.card_code', '=', 'cards.code')
            ->update([
                    'nfc_cards.card_id' => DB::raw('cards.id')
                ]);

        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->dropIndex(['card_code']);
            $table->dropColumn('card_code');

            // Re-add FK
            $table->foreign('card_id')->references('id')->on('cards')->nullOnDelete();
        });
    }
};
