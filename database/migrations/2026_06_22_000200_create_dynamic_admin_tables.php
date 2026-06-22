<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasars', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 150)->unique();
            $table->string('category', 80)->default('Pasar Rakyat')->index();
            $table->text('address')->nullable();
            $table->string('image')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('komoditas', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 150)->unique();
            $table->string('unit', 40)->default('kg');
            $table->string('image')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('commodity_price_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pasar_id')->constrained('pasars')->cascadeOnDelete();
            $table->foreignId('komoditas_id')->constrained('komoditas')->cascadeOnDelete();
            $table->date('price_date')->index();
            $table->unsignedInteger('price')->default(0);
            $table->unsignedInteger('previous_price')->default(0);
            $table->string('unit', 40)->nullable();
            $table->enum('status_validasi', ['pending', 'true', 'false'])->default('true')->index();
            $table->enum('indicator_status', ['aman', 'waspada', 'intervensi', 'belum_dikaji'])->default('belum_dikaji')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['pasar_id', 'komoditas_id', 'price_date'], 'unique_market_commodity_date');
        });

        Schema::create('het_hap_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('komoditas_id')->constrained('komoditas')->cascadeOnDelete();
            $table->foreignId('pasar_id')->nullable()->constrained('pasars')->nullOnDelete();
            $table->enum('type', ['HET', 'HAP'])->default('HAP')->index();
            $table->unsignedInteger('price')->default(0);
            $table->date('effective_date')->nullable()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('site_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title', 180);
            $table->string('slug', 180)->unique();
            $table->string('group', 80)->default('Profil')->index();
            $table->string('eyebrow', 120)->nullable();
            $table->string('image')->nullable();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->json('cards')->nullable();
            $table->boolean('is_published')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('download_documents', function (Blueprint $table) {
            $table->id();
            $table->string('title', 220);
            $table->string('category', 80)->index();
            $table->string('file_path');
            $table->boolean('is_published')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('survey_settings', function (Blueprint $table) {
            $table->id();
            $table->string('title', 180)->default('Survey Kepuasan Masyarakat');
            $table->string('external_url')->nullable();
            $table->string('qr_image')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('survey_settings');
        Schema::dropIfExists('download_documents');
        Schema::dropIfExists('site_pages');
        Schema::dropIfExists('het_hap_settings');
        Schema::dropIfExists('commodity_price_records');
        Schema::dropIfExists('komoditas');
        Schema::dropIfExists('pasars');
    }
};
