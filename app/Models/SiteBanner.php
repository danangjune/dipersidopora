<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteBanner extends Model
{
    protected $table = 'site_banners';

    protected $fillable = ['title', 'image', 'link_url', 'sort_order', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];
}
