<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            // Add pass_id as nullable integer (if not all records will have it immediately)
            $table->unsignedBigInteger('pass_id')->nullable()->after('card_id');
        });
    }

    public function down(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->dropColumn('pass_id');
        });
    }
};