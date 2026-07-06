<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_banners', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('image');
            $table->string('link_url')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 80)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        Schema::table('site_pages', function (Blueprint $table) {
            $table->string('external_url')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_banners');
        Schema::dropIfExists('site_settings');
        Schema::table('site_pages', function (Blueprint $table) {
            $table->dropColumn('external_url');
        });
    }
};
