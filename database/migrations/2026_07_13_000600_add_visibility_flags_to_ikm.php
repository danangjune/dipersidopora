<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ikm', function (Blueprint $table) {
            $table->boolean('show_contact')->default(true)->after('contact');
            $table->boolean('show_address')->default(true)->after('show_contact');
        });
    }

    public function down(): void
    {
        Schema::table('ikm', function (Blueprint $table) {
            $table->dropColumn(['show_contact', 'show_address']);
        });
    }
};
