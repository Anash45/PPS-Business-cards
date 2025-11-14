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
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->string('buttons_size')->nullable()->after('vcard_btn_bg_color');
            // replace 'some_existing_column' with the column you want this after
        });
    }

    public function down()
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn('buttons_size');
        });
    }

};
