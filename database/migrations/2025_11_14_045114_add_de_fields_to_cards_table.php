<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->string('degree_de')->nullable()->after('degree');
            $table->string('position_de')->nullable()->after('position');
            $table->string('department_de')->nullable()->after('department');
        });
    }

    public function down()
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn(['degree_de', 'position_de', 'department_de']);
        });
    }
};