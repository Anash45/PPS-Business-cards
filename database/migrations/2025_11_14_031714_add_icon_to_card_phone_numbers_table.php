<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->string('icon')->default('📞')->after('label');
        });
    }

    public function down()
    {
        Schema::table('card_phone_numbers', function (Blueprint $table) {
            $table->dropColumn('icon');
        });
    }
};
