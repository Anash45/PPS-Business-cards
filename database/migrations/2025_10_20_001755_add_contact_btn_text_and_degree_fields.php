<?php


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ Add to company_card_templates table
        Schema::table('company_card_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('company_card_templates', 'contact_btn_text')) {
                $table->string('contact_btn_text')->nullable()->default("Save contact details")->after('company_name');
            }
        });

        // ✅ Add to cards table
        Schema::table('cards', function (Blueprint $table) {
            if (!Schema::hasColumn('cards', 'degree')) {
                $table->string('degree')->nullable()->after('position');
            }
        });
    }

    public function down(): void
    {
        Schema::table('company_card_templates', function (Blueprint $table) {
            $table->dropColumn('contact_btn_text');
        });

        Schema::table('cards', function (Blueprint $table) {
            $table->dropColumn('degree');
        });
    }
};
