<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // order, reservation, staff, system
            $table->string('title');
            $table->string('message');
            $table->string('icon')->default('bell'); // bell, shopping-bag, calendar, user, alert
            $table->string('status')->default('unread'); // unread, read
            $table->unsignedBigInteger('reference_id')->nullable(); // refers to order/reservation id
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
