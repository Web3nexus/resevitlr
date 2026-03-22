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
        Schema::create('tenant_knowledge', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content')->nullable(); // Extracted text
            $table->string('type')->default('document'); // document, note, policy
            $table->string('file_path')->nullable(); // Original file
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_knowledge');
    }
};
