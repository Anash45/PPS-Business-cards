<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing IDs less than 100001
        DB::statement('UPDATE cards SET id = id + 100000 WHERE id < 100001');

        // Update the auto-increment value to 100001
        $tableName = 'cards';
        $maxId = DB::table($tableName)->max('id') ?? 100000;
        $nextId = $maxId + 1;

        DB::statement("ALTER TABLE {$tableName} AUTO_INCREMENT = {$nextId}");
    }

    public function down(): void
    {
        // Optional: cannot reliably revert existing IDs back
        // You can reset auto-increment to 1 if table is empty
        DB::statement('ALTER TABLE cards AUTO_INCREMENT = 1');
    }
};
