<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // card_emails
        Schema::table('card_emails', function (Blueprint $table) {
            $table->string('type')->nullable()->default('Work')->after('email');
        });

        // card_phone_numbers
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->string('type')->nullable()->default('Work')->after('phone_number');
        });

        // card_addresses
        Schema::table('card_addresses', function (Blueprint $table) {
            $table->string('type')->nullable()->default('Work')->after('address');
        });

        // ✅ Update existing records to "Work"
        DB::table('card_emails')->update(['type' => 'Work']);
        DB::table('card_phone_numbers')->update(['type' => 'Work']);
        DB::table('card_addresses')->update(['type' => 'Work']);
    }

    public function down(): void
    {
        Schema::table('card_emails', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('card_addresses', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};