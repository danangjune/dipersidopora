<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Komoditas extends Model
{
    use HasFactory;

    protected $table = 'komoditas';
    protected $fillable = ['name', 'slug', 'unit', 'image', 'is_active', 'sort_order'];
    protected $casts = ['is_active' => 'boolean'];

    protected static function booted(): void
    {
        static::saving(function (self $model) {
            if (! $model->slug) {
                $model->slug = Str::slug($model->name);
            }
        });
    }
}
