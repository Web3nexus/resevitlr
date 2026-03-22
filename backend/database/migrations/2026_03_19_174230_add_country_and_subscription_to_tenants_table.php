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
            $table->string('country')->nullable()->after('business_name');
            $table->string('subscription_id')->nullable()->after('plan');
            $table->string('subscription_provider')->nullable()->after('subscription_id');
            $table->string('subscription_status')->default('active')->after('subscription_provider');
            $table->timestamp('subscription_ends_at')->nullable()->after('subscription_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['country', 'subscription_id', 'subscription_provider', 'subscription_status', 'subscription_ends_at']);
        });
    }
};
