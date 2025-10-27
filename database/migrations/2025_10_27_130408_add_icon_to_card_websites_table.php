<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('card_websites', function (Blueprint $table) {
            $table->string('icon')->nullable()->after('card_id');
        });
    }

    public function down(): void
    {
        Schema::table('card_websites', function (Blueprint $table) {
            $table->dropColumn('icon');
        });
    }
};
