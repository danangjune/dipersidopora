<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DownloadDocument extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'category', 'file_path', 'is_published', 'sort_order'];
    protected $casts = ['is_published' => 'boolean'];
}
