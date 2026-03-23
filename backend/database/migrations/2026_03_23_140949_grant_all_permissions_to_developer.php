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
        $allPermissions = [
            'manage_tenants',
            'manage_subscriptions',
            'manage_admins',
            'manage_settings',
            'manage_cms',
            'manage_payments',
        ];

        \App\Models\Admin::where('is_developer', true)
            ->orWhere('email', 'admin@resevit.com')
            ->update([
                'permissions' => json_encode($allPermissions)
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('developer', function (Blueprint $table) {
            //
        });
    }
};
