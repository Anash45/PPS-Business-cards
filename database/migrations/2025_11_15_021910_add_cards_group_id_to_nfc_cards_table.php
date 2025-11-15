<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->foreignId('cards_group_id')
                ->nullable()
                ->after('company_id')
                ->constrained('cards_groups')
                ->nullOnDelete(); // if group deleted, set null
        });
    }

    public function down(): void
    {
        Schema::table('nfc_cards', function (Blueprint $table) {
            $table->dropForeign(['cards_group_id']);
            $table->dropColumn('cards_group_id');
        });
    }
};
