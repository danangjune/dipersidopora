<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ikm extends Model
{
    use HasFactory;

    public const CATEGORIES = ['fashion', 'kerajinan', 'makanan_minuman', 'lainnya'];

    protected $table = 'ikm';
    protected $fillable = ['name', 'category', 'owner', 'description', 'address', 'kelurahan', 'contact', 'location', 'image', 'is_active', 'sort_order', 'show_contact', 'show_address'];
    protected $casts = ['is_active' => 'boolean', 'show_contact' => 'boolean', 'show_address' => 'boolean'];
}
