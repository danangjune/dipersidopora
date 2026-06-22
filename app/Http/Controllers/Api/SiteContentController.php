<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DownloadDocument;
use App\Models\SitePage;
use App\Models\SurveySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SiteContentController extends Controller
{
    public function page(Request $request, string $slug)
    {
        $slug = trim($slug, '/');
        $slug = preg_replace('/\.php$/', '', $slug);
        $slug = str_replace('_', '-', $slug);

        $aliases = [
            'programKegiatan' => 'program-kegiatan', 'programkegiatan' => 'program-kegiatan',
            'td-gudang' => 'td-gudang', 'td_gudang' => 'td-gudang',
            'unduhan-renstra' => 'unduhan-renstra', 'unduhan-renja' => 'unduhan-renja', 'unduhan-laporan' => 'unduhan-laporan',
            'hargaKom' => 'harga-komoditas', 'hargakom' => 'harga-komoditas',
        ];
        $slug = $aliases[$slug] ?? $slug;

        $page = SitePage::query()->where('slug', $slug)->where('is_published', true)->first();
        abort_if(! $page, 404, 'Halaman tidak ditemukan.');
        return response()->json(['status' => 'success', 'data' => $page]);
    }

    public function downloads(string $category)
    {
        $items = DownloadDocument::query()
            ->where('category', $category)
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function surveySetting()
    {
        $setting = SurveySetting::query()->where('is_active', true)->latest()->first();
        return response()->json(['status' => 'success', 'data' => $setting]);
    }
}
