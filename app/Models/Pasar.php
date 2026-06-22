<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Pasar extends Model
{
    use HasFactory;

    protected $table = 'pasars';
    protected $fillable = ['name', 'slug', 'category', 'address', 'image', 'latitude', 'longitude', 'is_active', 'sort_order'];
    protected $casts = ['is_active' => 'boolean', 'latitude' => 'decimal:8', 'longitude' => 'decimal:8'];

    protected static function booted(): void
    {
        static::saving(function (self $model) {
            if (! $model->slug) {
                $model->slug = Str::slug($model->name);
            }
        });
    }
}
