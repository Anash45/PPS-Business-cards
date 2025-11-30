<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_impersonated')->nullable()->change();
            $table->unsignedBigInteger('impersonated_by')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_impersonated')->nullable(false)->default(false)->change();
            $table->unsignedBigInteger('impersonated_by')->nullable(false)->default(0)->change();
        });
    }
};
