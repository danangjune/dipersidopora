<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommodityPriceRecord extends Model
{
    use HasFactory;

    protected $fillable = ['pasar_id', 'komoditas_id', 'price_date', 'price', 'previous_price', 'unit', 'status_validasi', 'indicator_status', 'notes'];

    protected $casts = ['price_date' => 'date'];

    public function pasar()
    {
        return $this->belongsTo(Pasar::class);
    }

    public function komoditas()
    {
        return $this->belongsTo(Komoditas::class);
    }
}
