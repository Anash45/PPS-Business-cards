<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            // Add soft deletes
            $table->softDeletes();

            // Make cards_group_id nullable
            $table->unsignedBigInteger('cards_group_id')->nullable()->change();
            // Drop existing foreign key if any
            $table->dropForeign(['cards_group_id']);
            // Re-add foreign key with SET NULL on delete
            $table->foreign('cards_group_id')
                ->references('id')
                ->on('cards_groups')
                ->onDelete('set null');

            // Make company_id nullable
            $table->unsignedBigInteger('company_id')->nullable()->change();
            // Drop existing foreign key if any
            $table->dropForeign(['company_id']);
            // Re-add foreign key with SET NULL on delete
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('cards', function (Blueprint $table) {
            // Remove soft deletes
            $table->dropSoftDeletes();

            // Revert cards_group_id
            $table->unsignedBigInteger('cards_group_id')->nullable(false)->change();
            $table->dropForeign(['cards_group_id']);
            $table->foreign('cards_group_id')
                ->references('id')
                ->on('cards_groups')
                ->onDelete('cascade');

            // Revert company_id
            $table->unsignedBigInteger('company_id')->nullable(false)->change();
            $table->dropForeign(['company_id']);
            $table->foreign('company_id')
                ->references('id')
                ->on('companies')
                ->onDelete('cascade');
        });
    }
};
