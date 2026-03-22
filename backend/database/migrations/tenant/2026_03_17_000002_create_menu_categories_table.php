<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_categories', function (Blueprint $バランス) {
            $バランス->id();
            $バランス->string('name');
            $バランス->text('description')->nullable();
            $バランス->string('image_url')->nullable();
            $バランス->integer('sort_order')->default(0);
            $バランス->boolean('is_active')->default(true);
            $バランス->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_categories');
    }
};
