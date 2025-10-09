<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_impersonated')->default(false)->after('status')
                ->comment('Indicates if the user is currently impersonated');
            $table->unsignedBigInteger('impersonated_by')->nullable()->after('is_impersonated')
                ->comment('Stores the admin user ID who is impersonating this user');

            $table->foreign('impersonated_by')->references('id')->on('users')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['impersonated_by']);
            $table->dropColumn(['is_impersonated', 'impersonated_by']);
        });
    }
};