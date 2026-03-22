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
        Schema::create('ai_interactions', function (Blueprint $table) {
            $table->id();
            $table->string('platform')->default('Web'); // e.g., WhatsApp, Instagram
            $table->string('sender')->nullable(); // @username or phone number
            $table->text('content'); // The incoming message
            $table->text('reply')->nullable(); // AI's response
            $table->string('status')->default('received'); // received, thinking, replied, actioned
            $table->string('sentiment')->default('neutral'); // positive, neutral, negative
            $table->boolean('is_reservation')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_interactions');
    }
};
