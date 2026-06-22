<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SitePage extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'group', 'eyebrow', 'image', 'excerpt', 'content', 'cards', 'is_published', 'sort_order'];
    protected $casts = ['is_published' => 'boolean', 'cards' => 'array'];

    protected static function booted(): void
    {
        static::saving(function (self $model) {
            if (! $model->slug) {
                $model->slug = Str::slug($model->title);
            }
        });
    }
}
