<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ikm', function (Blueprint $table) {
            $table->string('kelurahan', 120)->nullable()->after('address');
            $table->string('location')->nullable()->after('contact');
        });
    }

    public function down(): void
    {
        Schema::table('ikm', function (Blueprint $table) {
            $table->dropColumn(['kelurahan', 'location']);
        });
    }
};
