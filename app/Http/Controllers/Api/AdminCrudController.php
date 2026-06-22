<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommodityPriceRecord;
use App\Models\DownloadDocument;
use App\Models\HetHapSetting;
use App\Models\Komoditas;
use App\Models\Pasar;
use App\Models\SitePage;
use App\Models\SurveySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCrudController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'markets' => Pasar::count(),
                'commodities' => Komoditas::count(),
                'prices' => CommodityPriceRecord::count(),
                'pages' => SitePage::count(),
                'pending_prices' => CommodityPriceRecord::where('status_validasi', 'pending')->count(),
            ],
        ]);
    }

    public function markets(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => Pasar::query()->orderBy('sort_order')->orderBy('name')->get()]);
        }
        $data = $request->validate($this->marketRules());
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        return response()->json(['status' => 'success', 'data' => Pasar::create($data)], 201);
    }

    public function updateMarket(Request $request, Pasar $market)
    {
        $data = $request->validate($this->marketRules(true));
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $market->update($data);
        return response()->json(['status' => 'success', 'data' => $market->fresh()]);
    }

    public function destroyMarket(Pasar $market)
    {
        $market->delete();
        return response()->json(['status' => 'success']);
    }

    public function commodities(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => Komoditas::query()->orderBy('sort_order')->orderBy('name')->get()]);
        }
        $data = $request->validate($this->commodityRules());
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        return response()->json(['status' => 'success', 'data' => Komoditas::create($data)], 201);
    }

    public function updateCommodity(Request $request, Komoditas $commodity)
    {
        $data = $request->validate($this->commodityRules(true));
        if (isset($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $commodity->update($data);
        return response()->json(['status' => 'success', 'data' => $commodity->fresh()]);
    }

    public function destroyCommodity(Komoditas $commodity)
    {
        $commodity->delete();
        return response()->json(['status' => 'success']);
    }

    public function prices(Request $request)
    {
        if ($request->isMethod('get')) {
            $rows = CommodityPriceRecord::query()
                ->with(['pasar:id,name', 'komoditas:id,name,unit,image'])
                ->when($request->integer('market_id'), fn ($q, $id) => $q->where('pasar_id', $id))
                ->when($request->integer('commodity_id'), fn ($q, $id) => $q->where('komoditas_id', $id))
                ->when($request->query('start_date'), fn ($q, $date) => $q->whereDate('price_date', '>=', $date))
                ->when($request->query('end_date'), fn ($q, $date) => $q->whereDate('price_date', '<=', $date))
                ->orderByDesc('price_date')
                ->limit((int) $request->query('limit', 200))
                ->get();
            return response()->json(['status' => 'success', 'data' => $rows]);
        }

        $data = $request->validate($this->priceRules());
        $previous = CommodityPriceRecord::query()
            ->where('pasar_id', $data['pasar_id'])
            ->where('komoditas_id', $data['komoditas_id'])
            ->whereDate('price_date', '<', $data['price_date'])
            ->orderByDesc('price_date')
            ->value('price') ?? ($data['previous_price'] ?? 0);
        $data['previous_price'] = $data['previous_price'] ?? $previous;
        $data['indicator_status'] = $data['indicator_status'] ?? 'belum_dikaji';
        $record = CommodityPriceRecord::updateOrCreate(
            ['pasar_id' => $data['pasar_id'], 'komoditas_id' => $data['komoditas_id'], 'price_date' => $data['price_date']],
            $data
        );
        return response()->json(['status' => 'success', 'data' => $record->load(['pasar:id,name', 'komoditas:id,name'])], 201);
    }

    public function updatePrice(Request $request, CommodityPriceRecord $price)
    {
        $data = $request->validate($this->priceRules(true));
        $price->update($data);
        return response()->json(['status' => 'success', 'data' => $price->fresh()->load(['pasar:id,name', 'komoditas:id,name'])]);
    }

    public function destroyPrice(CommodityPriceRecord $price)
    {
        $price->delete();
        return response()->json(['status' => 'success']);
    }

    public function hetHap(Request $request)
    {
        if ($request->isMethod('get')) {
            $rows = HetHapSetting::query()
                ->leftJoin('komoditas', 'komoditas.id', '=', 'het_hap_settings.komoditas_id')
                ->leftJoin('pasars', 'pasars.id', '=', 'het_hap_settings.pasar_id')
                ->select('het_hap_settings.*', 'komoditas.name as komoditas_name', 'pasars.name as pasar_name')
                ->orderBy('komoditas.name')
                ->get();
            return response()->json(['status' => 'success', 'data' => $rows]);
        }
        $data = $request->validate($this->hetRules());
        return response()->json(['status' => 'success', 'data' => HetHapSetting::create($data)], 201);
    }

    public function updateHetHap(Request $request, HetHapSetting $setting)
    {
        $setting->update($request->validate($this->hetRules(true)));
        return response()->json(['status' => 'success', 'data' => $setting->fresh()]);
    }

    public function destroyHetHap(HetHapSetting $setting)
    {
        $setting->delete();
        return response()->json(['status' => 'success']);
    }

    public function pages(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => SitePage::query()->orderBy('group')->orderBy('sort_order')->orderBy('title')->get()]);
        }
        $data = $request->validate($this->pageRules());
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        return response()->json(['status' => 'success', 'data' => SitePage::create($data)], 201);
    }

    public function updatePage(Request $request, SitePage $page)
    {
        $data = $request->validate($this->pageRules(true));
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        $page->update($data);
        return response()->json(['status' => 'success', 'data' => $page->fresh()]);
    }

    public function destroyPage(SitePage $page)
    {
        $page->delete();
        return response()->json(['status' => 'success']);
    }

    public function downloads(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => DownloadDocument::query()->orderBy('category')->orderBy('sort_order')->get()]);
        }
        return response()->json(['status' => 'success', 'data' => DownloadDocument::create($request->validate($this->downloadRules()))], 201);
    }

    public function updateDownload(Request $request, DownloadDocument $download)
    {
        $download->update($request->validate($this->downloadRules(true)));
        return response()->json(['status' => 'success', 'data' => $download->fresh()]);
    }

    public function destroyDownload(DownloadDocument $download)
    {
        $download->delete();
        return response()->json(['status' => 'success']);
    }

    public function surveySettings(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => SurveySetting::query()->latest()->get()]);
        }
        return response()->json(['status' => 'success', 'data' => SurveySetting::create($request->validate($this->surveyRules()))], 201);
    }

    public function updateSurveySetting(Request $request, SurveySetting $surveySetting)
    {
        $surveySetting->update($request->validate($this->surveyRules(true)));
        return response()->json(['status' => 'success', 'data' => $surveySetting->fresh()]);
    }

    public function destroySurveySetting(SurveySetting $surveySetting)
    {
        $surveySetting->delete();
        return response()->json(['status' => 'success']);
    }

    public function exportPrices(Request $request)
    {
        $rows = CommodityPriceRecord::query()
            ->join('pasars', 'pasars.id', '=', 'commodity_price_records.pasar_id')
            ->join('komoditas', 'komoditas.id', '=', 'commodity_price_records.komoditas_id')
            ->select('price_date', 'pasars.name as pasar', 'komoditas.name as komoditas', 'commodity_price_records.unit', 'price', 'previous_price', 'indicator_status', 'status_validasi')
            ->when($request->integer('market_id'), fn ($q, $id) => $q->where('pasar_id', $id))
            ->when($request->query('start_date'), fn ($q, $date) => $q->whereDate('price_date', '>=', $date))
            ->when($request->query('end_date'), fn ($q, $date) => $q->whereDate('price_date', '<=', $date))
            ->orderByDesc('price_date')
            ->get();

        $filename = 'harga-komoditas-'.now()->format('Ymd-His').'.xls';
        $html = view('exports.prices', ['rows' => $rows])->render();
        return response($html, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function marketRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'name' => [$req, 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:150'],
            'category' => ['nullable', 'string', 'max:80'],
            'address' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function commodityRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'name' => [$req, 'string', 'max:120'],
            'slug' => ['nullable', 'string', 'max:150'],
            'unit' => ['nullable', 'string', 'max:40'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function priceRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'pasar_id' => [$req, 'exists:pasars,id'],
            'komoditas_id' => [$req, 'exists:komoditas,id'],
            'price_date' => [$req, 'date'],
            'price' => [$req, 'integer', 'min:0'],
            'previous_price' => ['nullable', 'integer', 'min:0'],
            'unit' => ['nullable', 'string', 'max:40'],
            'status_validasi' => ['nullable', Rule::in(['pending', 'true', 'false'])],
            'indicator_status' => ['nullable', Rule::in(['aman', 'waspada', 'intervensi', 'belum_dikaji'])],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function hetRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'komoditas_id' => [$req, 'exists:komoditas,id'],
            'pasar_id' => ['nullable', 'exists:pasars,id'],
            'type' => [$req, Rule::in(['HET', 'HAP'])],
            'price' => [$req, 'integer', 'min:0'],
            'effective_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }

    private function pageRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'title' => [$req, 'string', 'max:180'],
            'slug' => ['nullable', 'string', 'max:180'],
            'group' => ['nullable', 'string', 'max:80'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'image' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'cards' => ['nullable', 'array'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function downloadRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'title' => [$req, 'string', 'max:220'],
            'category' => [$req, 'string', 'max:80'],
            'file_path' => [$req, 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function surveyRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'title' => [$req, 'string', 'max:180'],
            'external_url' => ['nullable', 'url', 'max:255'],
            'qr_image' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
