<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pedagang extends Model
{
    use HasFactory;

    protected $table = 'pedagang';

    protected $fillable = [
        'no_registrasi', 'nik', 'nama_pemilik', 'nama_usaha', 'alamat_ktp', 'kecamatan',
        'nama_kelurahan', 'alamat_usaha', 'deskripsi_alamat', 'jenis_jualan', 'jam_operasional',
        'no_hp', 'latitude', 'longitude', 'foto_ktp', 'foto_nib', 'foto_lapak', 'status_validasi',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];
}
