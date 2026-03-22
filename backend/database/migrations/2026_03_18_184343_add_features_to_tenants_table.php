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
        Schema::table('tenants', function (Blueprint $table) {
            if (!Schema::hasColumn('tenants', 'owner_name')) {
                $table->string('owner_name')->nullable();
            }
            if (!Schema::hasColumn('tenants', 'owner_email')) {
                $table->string('owner_email')->nullable();
            }
            if (!Schema::hasColumn('tenants', 'status')) {
                $table->string('status')->default('active');
            }
            if (!Schema::hasColumn('tenants', 'features')) {
                $table->json('features')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['owner_name', 'owner_email', 'status', 'features']);
        });
    }
};
