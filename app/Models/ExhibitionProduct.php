<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExhibitionProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'product_image',
        'images',
        'logo',
        'company',
        'phone',
        'website',
        'address',
        'detail_pdf',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'images' => 'array',
    ];
}
