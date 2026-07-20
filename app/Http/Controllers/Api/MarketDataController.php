<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommodityPriceRecord;
use App\Models\HetHapSetting;
use App\Models\Komoditas;
use App\Models\Pasar;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MarketDataController extends Controller
{
    public function filters()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'markets' => Pasar::query()->where('category', 'Pasar Rakyat')->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(),
                'commodities' => Komoditas::query()->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get(),
            ],
        ]);
    }

    public function publicSummary(Request $request)
    {
        [$start, $end] = $this->dateRange($request);
        $marketId = $request->integer('market_id') ?: null;
        $commodityIds = $request->query('commodity_ids');
        if (is_string($commodityIds)) {
            $commodityIds = array_filter(explode(',', $commodityIds));
        } else {
            $commodityIds = [];
        }
        $singleCommodityId = $request->integer('commodity_id') ?: null;
        if ($singleCommodityId) {
            $commodityIds[] = $singleCommodityId;
        }
        $internal = $request->boolean('internal', false);

        // Default ke data hari terbaru di Pasar Rakyat
        if (!$request->query('start_date') && !$request->query('end_date')) {
            $latestPasarRakyat = CommodityPriceRecord::query()
                ->join('pasars', 'pasars.id', '=', 'commodity_price_records.pasar_id')
                ->where('pasars.category', 'Pasar Rakyat')
                ->where('commodity_price_records.status_validasi', 'true')
                ->when($marketId, fn($q) => $q->where('commodity_price_records.pasar_id', $marketId))
                ->max('commodity_price_records.price_date');
            if ($latestPasarRakyat) {
                $end = Carbon::parse($latestPasarRakyat);
            }
            $start = $end->copy();
        }

        $query = CommodityPriceRecord::query()
            ->join('komoditas', 'komoditas.id', '=', 'commodity_price_records.komoditas_id')
            ->join('pasars', 'pasars.id', '=', 'commodity_price_records.pasar_id')
            ->leftJoin('het_hap_settings', function ($join) {
                $join->on('het_hap_settings.komoditas_id', '=', 'commodity_price_records.komoditas_id')
                    ->where('het_hap_settings.is_active', true);
            })
            ->where('commodity_price_records.status_validasi', 'true')
            ->where('pasars.category', 'Pasar Rakyat')
            ->whereBetween('commodity_price_records.price_date', [$start->toDateString(), $end->toDateString()])
            ->when($marketId, fn($q) => $q->where('commodity_price_records.pasar_id', $marketId))
            ->when(!empty($commodityIds), fn($q) => $q->whereIn('commodity_price_records.komoditas_id', $commodityIds));

        $rows = $query
            ->groupBy('komoditas.id', 'komoditas.name', 'komoditas.unit', 'komoditas.image')
            ->selectRaw('komoditas.id, komoditas.name, komoditas.unit, komoditas.image')
            ->selectRaw('FLOOR(AVG(commodity_price_records.price)) AS harga_sekarang')
            ->selectRaw('FLOOR(AVG(commodity_price_records.previous_price)) AS harga_sebelumnya')
            ->selectRaw('MAX(commodity_price_records.price_date) AS latest_date')
            ->selectRaw('COUNT(DISTINCT commodity_price_records.pasar_id) AS market_count')
            ->selectRaw('MAX(het_hap_settings.price) AS reference_price')
            ->orderBy('komoditas.name')
            ->get()
            ->map(fn($row) => $this->formatSummaryRow($row, $internal));

        // Weekly average for Rata-rata column
        $weekAgo = $end->copy()->subDays(6);
        $weeklyAvg = CommodityPriceRecord::query()
            ->join('pasars', 'pasars.id', '=', 'commodity_price_records.pasar_id')
            ->where('commodity_price_records.status_validasi', 'true')
            ->where('pasars.category', 'Pasar Rakyat')
            ->whereBetween('commodity_price_records.price_date', [$weekAgo->toDateString(), $end->toDateString()])
            ->when($marketId, fn($q) => $q->where('commodity_price_records.pasar_id', $marketId))
            ->when(!empty($commodityIds), fn($q) => $q->whereIn('commodity_price_records.komoditas_id', $commodityIds))
            ->groupBy('commodity_price_records.komoditas_id')
            ->selectRaw('commodity_price_records.komoditas_id, FLOOR(AVG(commodity_price_records.price)) AS rata_rata')
            ->pluck('rata_rata', 'komoditas_id');

        $rows = $rows->map(fn($row) => array_merge($row, [
            'rata_rata' => (int) ($weeklyAvg[$row['commodity_id']] ?? 0),
        ]));

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => ['start' => $start->toDateString(), 'end' => $end->toDateString(), 'label' => 'Harga Terkini'],
                'rows' => $rows,
                'total' => $rows->count(),
            ],
        ]);
    }

    public function chart(Request $request)
    {
        [$start, $end] = $this->dateRange($request);
        $marketId = $request->integer('market_id') ?: null;
        $commodityIds = $request->query('commodity_ids');

        if (is_string($commodityIds)) {
            $commodityIds = array_filter(explode(',', $commodityIds));
        } elseif (!is_array($commodityIds)) {
            $commodityIds = [];
        }

        $query = CommodityPriceRecord::query()
            ->join('komoditas', 'komoditas.id', '=', 'commodity_price_records.komoditas_id')
            ->join('pasars', 'pasars.id', '=', 'commodity_price_records.pasar_id')
            ->where('status_validasi', 'true')
            ->where('pasars.category', 'Pasar Rakyat')
            ->whereBetween('commodity_price_records.price_date', [$start->toDateString(), $end->toDateString()])
            ->when($marketId, fn($q) => $q->where('commodity_price_records.pasar_id', $marketId))
            ->when(!empty($commodityIds), fn($q) => $q->whereIn('commodity_price_records.komoditas_id', $commodityIds))
            ->groupBy('commodity_price_records.price_date', 'komoditas.id', 'komoditas.name')
            ->selectRaw('commodity_price_records.price_date, komoditas.id AS commodity_id, komoditas.name AS commodity_name, FLOOR(AVG(commodity_price_records.price)) AS average_price')
            ->orderBy('commodity_price_records.price_date')
            ->limit(500)
            ->get();

        $dates = $query->pluck('price_date')->unique()->sort()->values()
            ->map(fn($d) => $d instanceof \Carbon\Carbon ? $d->toDateString() : $d);
        $series = $query->groupBy('commodity_id')->map(function ($items, $cid) use ($dates) {
            $byDate = $items->keyBy(fn($item) => $item->price_date instanceof \Carbon\Carbon ? $item->price_date->toDateString() : $item->price_date);
            return [
                'commodity_id' => (int) $cid,
                'name' => $items->first()->commodity_name,
                'data' => $dates->map(fn($d) => isset($byDate[$d]) ? (int) $byDate[$d]->average_price : null),
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'dates' => $dates,
                'series' => $series,
            ],
        ]);
    }

    public function adminAverages(Request $request)
    {
        $marketId = $request->integer('market_id') ?: null;
        $commodityId = $request->integer('commodity_id') ?: null;
        $end = $request->date('end_date') ? Carbon::parse($request->query('end_date')) : now();

        $periods = [
            'weekly' => $end->copy()->subDays(6),
            'monthly' => $end->copy()->subMonth()->addDay(),
            'yearly' => $end->copy()->subYear()->addDay(),
        ];

        $data = [];
        foreach ($periods as $key => $start) {
            $data[$key] = CommodityPriceRecord::query()
                ->join('komoditas', 'komoditas.id', '=', 'commodity_price_records.komoditas_id')
                ->where('status_validasi', 'true')
                ->whereBetween('price_date', [$start->toDateString(), $end->toDateString()])
                ->when($marketId, fn($q) => $q->where('pasar_id', $marketId))
                ->when($commodityId, fn($q) => $q->where('komoditas_id', $commodityId))
                ->groupBy('komoditas.id', 'komoditas.name', 'komoditas.unit')
                ->selectRaw('komoditas.id, komoditas.name, komoditas.unit, FLOOR(AVG(price)) AS average_price, COUNT(*) AS total_records')
                ->orderBy('komoditas.name')
                ->get();
        }

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    private function formatSummaryRow($row, bool $internal = false): array
    {
        $hargaSekarang = (int) ($row->harga_sekarang ?? 0);
        $hargaSebelumnya = (int) ($row->harga_sebelumnya ?? 0);
        $diff = $hargaSekarang - $hargaSebelumnya;
        $reference = $row->reference_price ? (int) $row->reference_price : null;
        $indicator = 'belum_dikaji';

        // Normal: harga rata-rata pasar di bawah HET/HAP.
        // Waspada: harga rata-rata pasar mulai dari HET/HAP sampai 110% HET/HAP.
        // Intervensi: harga rata-rata pasar lebih dari 110% HET/HAP.

        if ($reference) {
            if ($hargaSekarang <= $reference) {
                $indicator = 'aman';
            } elseif ($hargaSekarang <= round($reference * 1.10)) {
                $indicator = 'waspada';
            } else {
                $indicator = 'intervensi';
            }
        }

        $payload = [
            'commodity_id' => (int) $row->id,
            'nama_komoditas' => $row->name,
            'unit' => $row->unit,
            'image' => $row->image,
            'url_gambar' => asset('assets/images/komoditas/' . ($row->image ?: 'default.png')),
            'harga_sekarang' => $hargaSekarang,
            'harga_sebelumnya' => $hargaSebelumnya,
            'selisih' => $diff,
            'tren' => $diff > 0 ? 'naik' : ($diff < 0 ? 'turun' : 'tetap'),
            'latest_date' => $row->latest_date,
            'market_count' => (int) $row->market_count,
            'reference_price' => $reference,
        ];

        if ($internal) {
            $payload['indicator_status'] = $indicator;
        }

        return $payload;
    }

    private function dateRange(Request $request): array
    {
        $end = $request->query('end_date') ? Carbon::parse($request->query('end_date')) : null;
        $start = $request->query('start_date') ? Carbon::parse($request->query('start_date')) : null;

        if (!$end) {
            $latest = CommodityPriceRecord::max('price_date');
            $end = $latest ? Carbon::parse($latest) : now();
        }

        if (!$start) {
            $start = $end->copy()->subDays(6);
        }

        if ($start->gt($end)) {
            [$start, $end] = [$end, $start];
        }

        return [$start->startOfDay(), $end->startOfDay()];
    }
}
