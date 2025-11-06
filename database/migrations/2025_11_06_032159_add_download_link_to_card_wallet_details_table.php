<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->string('download_link')->nullable()->after('wallet_title');
        });
    }

    public function down(): void
    {
        Schema::table('card_wallet_details', function (Blueprint $table) {
            $table->dropColumn('download_link');
        });
    }
};
