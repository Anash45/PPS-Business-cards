<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->string('salutation')->nullable()->after('status');
            $table->string('title')->nullable()->after('salutation');
            $table->string('first_name')->nullable()->after('title');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('profile_image')->nullable()->after('last_name');
            $table->string('position')->nullable()->after('profile_image');
            $table->string('department')->nullable()->after('position');
        });
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn([
                'salutation',
                'title',
                'first_name',
                'last_name',
                'profile_image',
                'position',
                'department',
            ]);
        });
    }
};
