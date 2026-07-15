<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tb_counter', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('counts')->default(0);
            $table->timestamps();
        });

        Schema::create('kuesioner', function (Blueprint $table) {
            $table->id('id_kuesioner');
            $table->string('nama', 100);
            $table->string('domisili', 150);
            for ($i = 1; $i <= 9; $i++) {
                $table->unsignedTinyInteger("U{$i}");
            }
            $table->timestamps();
        });

        Schema::create('kuesioner_hasil', function (Blueprint $table) {
            $table->id();
            for ($i = 1; $i <= 9; $i++) {
                $table->unsignedInteger("total_U{$i}")->default(0);
            }
            for ($i = 1; $i <= 9; $i++) {
                $table->decimal("rata_U{$i}", 8, 4)->default(0);
            }
            $table->unsignedInteger('total_semua')->default(0);
            $table->decimal('nilai_interval', 8, 4)->default(0);
            $table->timestamps();
        });

        
    }

    public function down(): void
    {
        Schema::dropIfExists('kuesioner_hasil');
        Schema::dropIfExists('kuesioner');
        Schema::dropIfExists('tb_counter');
    }
};
