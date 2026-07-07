<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HetHapSetting extends Model
{
    use HasFactory;

    protected $table = 'het_hap_settings';
    protected $fillable = ['komoditas_id', 'pasar_id', 'price', 'effective_date', 'is_active', 'notes'];
    protected $casts = ['is_active' => 'boolean', 'effective_date' => 'date'];
}
