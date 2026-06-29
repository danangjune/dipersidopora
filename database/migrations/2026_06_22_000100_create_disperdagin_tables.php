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


        Schema::create('pedagang', function (Blueprint $table) {
            $table->id();
            $table->string('no_registrasi', 30)->nullable()->index();
            $table->string('nik', 16)->nullable()->index();
            $table->string('nama_pemilik', 100)->nullable()->index();
            $table->text('alamat_ktp')->nullable();
            $table->string('kecamatan', 50)->nullable()->index();
            $table->string('nama_kelurahan', 50)->nullable()->index();
            $table->text('alamat_usaha')->nullable();
            $table->text('deskripsi_alamat')->nullable();
            $table->string('jenis_jualan', 80)->nullable()->index();
            $table->string('jam_operasional', 80)->nullable();
            $table->string('no_hp', 20)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('foto_ktp')->nullable();
            $table->string('foto_nib')->nullable();
            $table->string('foto_lapak')->nullable();
            $table->enum('status_validasi', ['pending', 'true', 'false'])->default('pending')->index();
            $table->string('nama_usaha', 100)->nullable()->index();
            $table->timestamps();
        });

        Schema::create('login_pkl', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('role')->default('surveyor');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_pkl');
        Schema::dropIfExists('pedagang');
        Schema::dropIfExists('kuesioner_hasil');
        Schema::dropIfExists('kuesioner');
        Schema::dropIfExists('tb_counter');
    }
};
