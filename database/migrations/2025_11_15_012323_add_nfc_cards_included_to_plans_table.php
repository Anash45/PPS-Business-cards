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
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('nfc_cards_included')->default(0)->after('cards_included');
        });

        // Update existing records: nfc = cards_included * 5
        DB::table('plans')->update([
            'nfc_cards_included' => DB::raw('cards_included * 5')
        ]);
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('nfc_cards_included');
        });
    }
};
