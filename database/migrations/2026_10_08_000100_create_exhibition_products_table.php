<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exhibition_products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 180);
            $table->string('product_image')->nullable();
            $table->string('logo')->nullable();
            $table->string('company', 180)->index();
            $table->string('phone', 40)->nullable();
            $table->string('website')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exhibition_products');
    }
};
