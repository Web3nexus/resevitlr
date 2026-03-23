<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Monthly reservation limit (null = unlimited)
            $table->integer('reservation_limit')->nullable()->after('features')
                ->comment('Max reservations per month. NULL = unlimited.');
            // Max staff accounts per tenant
            $table->integer('max_staff')->nullable()->after('reservation_limit')
                ->comment('Max staff accounts. NULL = unlimited.');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['reservation_limit', 'max_staff']);
        });
    }
};
