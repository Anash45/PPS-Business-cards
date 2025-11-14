<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->string('contact_btn_text_de')
                ->nullable()
                ->after('contact_btn_text');
        });
    }

    public function down()
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn('contact_btn_text_de');
        });
    }
};