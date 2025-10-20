<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // --- Update card_addresses table ---
        Schema::table('card_addresses', function (Blueprint $table) {
            // Add new structured fields
            $table->string('street')->nullable()->after('type');
            $table->string('house_number')->nullable()->after('street');
            $table->string('zip')->nullable()->after('house_number');
            $table->string('city')->nullable()->after('zip');
            $table->string('country')->nullable()->after('city');

            // Drop old combined address field
            if (Schema::hasColumn('card_addresses', 'address')) {
                $table->dropColumn('address');
            }

            // Remove color fields
            if (Schema::hasColumn('card_addresses', 'text_color')) {
                $table->dropColumn('text_color');
            }
            if (Schema::hasColumn('card_addresses', 'bg_color')) {
                $table->dropColumn('bg_color');
            }
        });

        // --- Remove color fields from card_emails ---
        Schema::table('card_emails', function (Blueprint $table) {
            if (Schema::hasColumn('card_emails', 'text_color')) {
                $table->dropColumn('text_color');
            }
            if (Schema::hasColumn('card_emails', 'bg_color')) {
                $table->dropColumn('bg_color');
            }
        });

        // --- Remove color fields from card_phone_numbers ---
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            if (Schema::hasColumn('card_phone_numbers', 'text_color')) {
                $table->dropColumn('text_color');
            }
            if (Schema::hasColumn('card_phone_numbers', 'bg_color')) {
                $table->dropColumn('bg_color');
            }
        });
    }

    public function down(): void
    {
        Schema::table('card_addresses', function (Blueprint $table) {
            $table->string('address')->nullable();
            $table->dropColumn(['street', 'house_number', 'zip', 'city', 'country']);
            $table->string('text_color')->nullable();
            $table->string('bg_color')->nullable();
        });

        Schema::table('card_emails', function (Blueprint $table) {
            $table->string('text_color')->nullable();
            $table->string('bg_color')->nullable();
        });

        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->string('text_color')->nullable();
            $table->string('bg_color')->nullable();
        });
    }
};