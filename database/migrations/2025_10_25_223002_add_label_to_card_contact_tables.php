<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->string('label')->nullable()->after('card_id');
        });

        Schema::table('card_emails', function (Blueprint $table) {
            $table->string('label')->nullable()->after('card_id');
        });

        Schema::table('card_addresses', function (Blueprint $table) {
            $table->string('label')->nullable()->after('card_id');
        });
    }

    public function down(): void
    {
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->dropColumn('label');
        });

        Schema::table('card_emails', function (Blueprint $table) {
            $table->dropColumn('label');
        });

        Schema::table('card_addresses', function (Blueprint $table) {
            $table->dropColumn('label');
        });
    }
};
