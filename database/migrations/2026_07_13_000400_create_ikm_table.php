<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ikm', function (Blueprint $table) {
            $table->id();
            $table->string('name', 180);
            $table->string('category', 60)->index();
            $table->string('owner', 120)->nullable();
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('contact', 120)->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ikm');
    }
};
