<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // card_buttons
        Schema::table('card_buttons', function (Blueprint $table) {
            $table->string('button_text_de')->nullable()->after('button_text');
        });

        // card_emails
        Schema::table('card_emails', function (Blueprint $table) {
            $table->string('label_de')->nullable()->after('label');
        });

        // card_websites
        Schema::table('card_websites', function (Blueprint $table) {
            $table->string('label_de')->nullable()->after('label');
        });

        // card_addresses
        Schema::table('card_addresses', function (Blueprint $table) {
            $table->string('label_de')->nullable()->after('label');
        });

        // card_phone_numbers
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->string('label_de')->nullable()->after('label');
        });
    }

    public function down()
    {
        Schema::table('card_buttons', function (Blueprint $table) {
            $table->dropColumn('button_text_de');
        });

        Schema::table('card_emails', function (Blueprint $table) {
            $table->dropColumn('label_de');
        });

        Schema::table('card_websites', function (Blueprint $table) {
            $table->dropColumn('label_de');
        });

        Schema::table('card_addresses', function (Blueprint $table) {
            $table->dropColumn('label_de');
        });

        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->dropColumn('label_de');
        });
    }
};
