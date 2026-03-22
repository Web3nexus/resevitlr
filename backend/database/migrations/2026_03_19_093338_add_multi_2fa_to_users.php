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
        Schema::table('users', function (Blueprint $table) {
            $table->string('two_factor_method')->default('none'); // none, email, totp, pin
            $table->string('two_factor_secret')->nullable(); // For TOTP
            $table->string('login_pin')->nullable(); // Hashed PIN
            $table->string('two_factor_code')->nullable();
            $table->dateTime('two_factor_expires_at')->nullable();
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->string('two_factor_method')->default('none'); 
            $table->string('two_factor_secret')->nullable();
            $table->string('login_pin')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['two_factor_method', 'two_factor_secret', 'login_pin', 'two_factor_code', 'two_factor_expires_at']);
        });

        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['two_factor_method', 'two_factor_secret', 'login_pin']);
        });
    }
};
