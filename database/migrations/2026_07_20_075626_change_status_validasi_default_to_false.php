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
        Schema::table('commodity_price_records', function (Blueprint $table) {
            $table->enum('status_validasi', ['pending', 'true', 'false'])->default('false')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commodity_price_records', function (Blueprint $table) {
            $table->enum('status_validasi', ['pending', 'true', 'false'])->default('true')->change();
        });
    }
};
