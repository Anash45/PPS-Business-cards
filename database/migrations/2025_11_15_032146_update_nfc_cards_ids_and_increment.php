<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Shift existing IDs by 10000
        DB::statement('UPDATE nfc_cards SET id = id + 10000');

        // Reset auto-increment to start at 10001
        $maxId = DB::table('nfc_cards')->max('id') ?? 0;
        $start = max($maxId + 1, 10001);
        DB::statement("ALTER TABLE nfc_cards AUTO_INCREMENT = $start");
    }

    public function down(): void
    {
        // Revert IDs back to original
        DB::statement('UPDATE nfc_cards SET id = id - 10000');

        // Reset auto-increment to max ID + 1
        $maxId = DB::table('nfc_cards')->max('id') ?? 0;
        DB::statement("ALTER TABLE nfc_cards AUTO_INCREMENT = " . ($maxId + 1));
    }
};
