<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ Update enum values to include 'template_editor'
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'company', 'editor', 'team', 'template_editor') NOT NULL DEFAULT 'team'");
    }

    public function down(): void
    {
        // 🔙 Revert back to original enum values
        DB::statement("ALTER TABLE users MODIFY role ENUM('admin', 'company', 'editor', 'team') NOT NULL DEFAULT 'team'");
    }
};
