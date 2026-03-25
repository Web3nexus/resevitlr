<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ai_interactions', function (Blueprint $table) {
            $table->string('platform_account_id')->nullable()->after('platform');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_interactions', function (Blueprint $table) {
            $table->dropColumn('platform_account_id');
        });
    }
};
