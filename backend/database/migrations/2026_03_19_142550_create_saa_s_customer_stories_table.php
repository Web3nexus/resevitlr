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
        Schema::create('saa_s_customer_stories', function (Blueprint $table) {
            $table->id();
            $table->string('client_name');
            $table->string('slug')->unique();
            $table->string('logo_url')->nullable();
            $table->json('metrics')->nullable();
            $table->longText('content');
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saa_s_customer_stories');
    }
};
