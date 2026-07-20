<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommodityPriceRecord;
use App\Models\DownloadDocument;
use App\Models\HetHapSetting;
use App\Models\Ikm;
use App\Models\Komoditas;
use App\Models\Pasar;
use App\Models\SiteBanner;
use App\Models\SitePage;
use App\Models\SurveySetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminCrudController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->user_id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->user_role,
            ],
        ]);
    }

    public function dashboard()
    {
        $today = now()->toDateString();
        $yesterday = now()->subDay()->toDateString();

        $pasarRakyatIds = Pasar::where('category', 'Pasar Rakyat')->pluck('id');

        $avgToday = CommodityPriceRecord::whereIn('pasar_id', $pasarRakyatIds)->whereDate('price_date', $today)->avg('price');
        $avgYesterday = CommodityPriceRecord::whereIn('pasar_id', $pasarRakyatIds)->whereDate('price_date', $yesterday)->avg('price');
        $priceTrend = $avgToday && $avgYesterday ? round((($avgToday - $avgYesterday) / $avgYesterday) * 100, 1) : 0;

        $ikmCategories = Ikm::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')->pluck('count', 'category')->toArray();

        $marketCategories = Pasar::selectRaw('category, COUNT(*) as count')
            ->groupBy('category')->pluck('count', 'category')->toArray();

        $recentPrices = CommodityPriceRecord::with(['pasar:id,name', 'komoditas:id,name,unit'])
            ->whereIn('pasar_id', $pasarRakyatIds)
            ->whereDate('price_date', $today)
            ->where('price', '>', 0)
            ->orderByDesc('id')->limit(500)->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'pasar' => $r->pasar?->name,
                'komoditas' => $r->komoditas?->name,
                'unit' => $r->komoditas?->unit,
                'price' => (int) $r->price,
                'previous_price' => (int) ($r->previous_price ?? 0),
            ]);

        $totalIkm = Ikm::count();
        $pedagangCount = \App\Models\Pedagang::count();
        $totalMarkets = Pasar::count();
        $totalCommodities = Komoditas::count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'markets' => $totalMarkets,
                'commodities' => $totalCommodities,
                'ikm' => $totalIkm,
                'pedagang' => $pedagangCount,
                'price_avg_today' => round((float) ($avgToday ?: 0)),
                'price_avg_yesterday' => round((float) ($avgYesterday ?: 0)),
                'price_trend' => $priceTrend,
                'ikm_categories' => $ikmCategories,
                'market_categories' => $marketCategories,
                'recent_prices' => $recentPrices,
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
                ->get()
                ->each(function ($row) {
                    $row->pasar_name = $row->pasar?->name;
                    $row->komoditas_name = $row->komoditas?->name;
                });
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

    public function bulkPrices(Request $request)
    {
        $data = $request->validate([
            'pasar_id' => ['required', 'exists:pasars,id'],
            'price_date' => ['required', 'date'],
            'prices' => ['required', 'array'],
            'prices.*.komoditas_id' => ['required', 'exists:komoditas,id'],
            'prices.*.price' => ['nullable', 'integer', 'min:0'],
            'prices.*.previous_price' => ['nullable', 'integer', 'min:0'],
        ]);

        $saved = [];
        foreach ($data['prices'] as $item) {
            if ($item['price'] === null || $item['price'] === '' || $item['price'] < 0) {
                continue;
            }
            $previous = $item['previous_price']
                ?? CommodityPriceRecord::query()
                    ->where('pasar_id', $data['pasar_id'])
                    ->where('komoditas_id', $item['komoditas_id'])
                    ->whereDate('price_date', '<', $data['price_date'])
                    ->orderByDesc('price_date')
                    ->value('price')
                ?? 0;
            $record = CommodityPriceRecord::updateOrCreate(
                ['pasar_id' => $data['pasar_id'], 'komoditas_id' => $item['komoditas_id'], 'price_date' => $data['price_date']],
                ['price' => $item['price'], 'previous_price' => $previous, 'indicator_status' => 'belum_dikaji']
            );
            $saved[] = $record;
        }

        return response()->json(['status' => 'success', 'data' => $saved, 'count' => count($saved)]);
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

    public function ikm(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => Ikm::query()->orderBy('sort_order')->orderBy('name')->get()]);
        }
        $data = $request->validate($this->ikmRules());
        return response()->json(['status' => 'success', 'data' => Ikm::create($data)], 201);
    }

    public function updateIkm(Request $request, Ikm $ikm)
    {
        $ikm->update($request->validate($this->ikmRules(true)));
        return response()->json(['status' => 'success', 'data' => $ikm->fresh()]);
    }

    public function destroyIkm(Ikm $ikm)
    {
        $ikm->delete();
        return response()->json(['status' => 'success']);
    }

    public function tentang()
    {
        $defaults = [
            'logo' => 'images/d1.png',
            'kadin' => [
                'photo' => 'images/ft1.png',
                'name' => 'WAHYU KUSUMA WARDANI, SSTP.MM',
                'title' => 'Kepala Dinas',
                'description' => "Dinas Perdagangan dan Perindustrian Kota Kediri adalah salah satu bagian penting dari Pemerintah Kota Kediri yang memiliki peran vital dalam mengelola dan mengembangkan sektor perdagangan dan perindustrian. Mulai dari merancang kebijakan pembangunan yang inovatif, mengawasi dan mengatur izin usaha industri, hingga mengelola sistem informasi industri nasional, dilakukan dengan tujuan untuk mendorong pertumbuhan ekonomi dan memastikan perkembangan industri yang berkelanjutan.\n\nDinas Perdagangan dan Perindustrian Kota Kediri berkomitmen untuk menciptakan lingkungan usaha yang kondusif dan mendukung kemajuan industri lokal.",
            ],
            'bidang' => [
                ['title' => 'Perdagangan', 'desc' => 'Merencanakan, melaksanakan, mengkoordinasikan dan mengendalikan kebijakan pengembangan perdagangan dalam dan luar negeri, kebijakan stabilisasi harga barang dan rekomendasi perizinan usaha.'],
                ['title' => 'Perindustrian', 'desc' => 'Merencanakan, melaksanakan, mengkoordinasikan dan mengendalikan kebijakan perencanaan dan pembangunan industri, pengendalian usaha izin usaha industri, dan pengelolaan sistem informasi industri nasional.'],
                ['title' => 'Kemetrologian', 'desc' => 'Merencanakan, melaksanakan, mengkoordinasikan dan mengendalikan kebijakan standardisasi dan perlindungan konsumen.'],
            ],
            'alamat' => [
                ['title' => 'Kantor DISPERDAGIN Kota Kediri', 'address' => 'Jl. Penanggungan No. 7, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114'],
                ['title' => 'Unit Metrologi Legal', 'address' => 'Jl. Penanggungan No. 45, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114'],
                ['title' => 'Unit Metrologi Tangki Ukur Mobil (TUM)', 'address' => 'Jl. Sudanco Supriadi No.3, Mojoroto, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114'],
            ],
            'kontak' => [
                ['label' => 'Email', 'value' => 'disperdagin@kedirikota.go.id', 'href' => 'mailto:disperdagin@kedirikota.go.id'],
                ['label' => 'Phone', 'value' => '0354771908', 'href' => 'tel:0354771908'],
                ['label' => 'Instagram', 'value' => '@disperdagin_kotakediri', 'href' => 'https://www.instagram.com/disperdagin_kotakediri'],
                ['label' => 'Youtube', 'value' => 'DISPERDAGIN Kota Kediri', 'href' => 'https://www.youtube.com/@disperdaginkotakediri7304'],
                ['label' => 'Website', 'value' => 'disperdagin.kedirikota.go.id', 'href' => 'https://disperdagin.kedirikota.go.id'],
            ],
            'maps_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.482145629552!2d112.0164!3d-7.8169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785b7e2e7b6c8d%3A0x8f0e5c5f5b5e5a5f!2sJl.%20Penanggungan%20No.7%2C%20Bandar%20Lor%2C%20Kec.%20Mojoroto%2C%20Kota%20Kediri%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1',
        ];

        $page = SitePage::query()->where('slug', 'tentang')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'DISPERDAGIN Kota Kediri',
                'slug' => 'tentang',
                'group' => 'Profil',
                'eyebrow' => 'Profil',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['tentang_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateTentang(Request $request)
    {
        $page = SitePage::query()->where('slug', 'tentang')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'tentang_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['tentang_data'])) {
            $updateData['content'] = json_encode($validated['tentang_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['tentang_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function layananHalal()
    {
        $defaults = [
            'intro' => 'Tata Cara Pendaftaran Sertifikasi Halal',
            'description' => 'Persyaratan yang dibutuhkan :',
            'requirements' => [
                'Surat Permohonan',
                'Formulir Permohonan',
                'NIB',
                'Dokumen Penyelia halal (SK penetapan penyelia halal, salinan KTP, daftar riwayat hidup)',
                'Daftar Nama Produk',
                'Daftar produk dan bahan yang digunakan',
                'Manual SJPH',
                'Izin edar atau SLHS (jika ada)',
            ],
            'download_label' => 'Unduh Panduan Lengkap Sertifikasi Halal',
            'download_file' => 'aset_download/File Layanan Disperdagin Halal.pdf',
            'flowchart_reguler' => 'images/flowchart_halalReguler.png',
            'flowchart_gratis' => 'images/flowchart_halalGratis.png',
        ];

        $page = SitePage::query()->where('slug', 'layanan/halal')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Sertifikasi Halal',
                'slug' => 'layanan/halal',
                'group' => 'Layanan',
                'eyebrow' => 'Layanan',
                'image' => 'images/flowchart_sidangtera.png',
                'excerpt' => 'Informasi prosedur sertifikasi halal.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['halal_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateLayananHalal(Request $request)
    {
        $page = SitePage::query()->where('slug', 'layanan/halal')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'halal_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['halal_data'])) {
            $updateData['content'] = json_encode($validated['halal_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['halal_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function layananMerk()
    {
        $defaults = [
            'intro' => 'Tata Cara Pendaftaran Legalitas Merek',
            'description' => 'Persyaratan yang dibutuhkan :',
            'mandiri_title' => 'Persyaratan pendaftaran mandiri :',
            'mandiri_requirements' => [
                'E-tiket Merk / label merek (JPG)',
                'Scan TTD permohonan (JPG)',
                'Surat rekomendasi UKM dari Disperindag/Koperasi (jika UMKM)',
                'Surat pernyataan UKM bermaterai (jika UMKM)',
            ],
            'fasilitas_title' => 'Persyaratan pendaftaran melalui fasilitas Disperdagin :',
            'fasilitas_requirements' => [
                'Formulir',
                'E-tiket Merk / label merek (JPG)',
                'Scan TTD permohonan (JPG)',
                'Surat rekomendasi UKM dari Disperindag/Koperasi (jika UMKM)',
                'Surat pernyataan UKM bermaterai (jika UMKM)',
            ],
            'download_label' => 'Unduh Panduan Lengkap Legalitas Merk',
            'download_file' => 'aset_download/File Layanan Disperdagin Merk.pdf',
            'flowchart' => 'images/flowchart_merk.png',
        ];

        $page = SitePage::query()->where('slug', 'layanan/merk')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Legalitas Merk',
                'slug' => 'layanan/merk',
                'group' => 'Layanan',
                'eyebrow' => 'Layanan',
                'image' => 'images/flowchart_sidangtera.png',
                'excerpt' => 'Informasi prosedur legalitas merk.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['merk_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateLayananMerk(Request $request)
    {
        $page = SitePage::query()->where('slug', 'layanan/merk')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'merk_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['merk_data'])) {
            $updateData['content'] = json_encode($validated['merk_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['merk_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function layananSinas()
    {
        $defaults = [
            'intro' => 'Tata Cara Pendaftaran SIINas',
            'description' => 'Persyaratan yang dibutuhkan :',
            'registrasi_title' => 'Persyaratan registrasi :',
            'registrasi_requirements' => [
                'NPWP',
                'NiB OSSRBA',
                'Email (Email yang didaftarkan harus sama dengan email yang tercantum pada NIB)',
            ],
            'dokumen_title' => 'Persyaratan minimum upload dokumen :',
            'dokumen_requirements' => [
                'Akta pendirian perusahaan/akta perusahaan',
                'NIB',
                'NPWP',
                'Dokumen perizinan berusaha sektor industri (PB-Sektor Industri)',
                'Rendah (Upload NIB)',
                'Menengah Rendah + Menengah Tinggi (Upload Sertif Standar)',
                'Tinggi (Upload Izin)',
            ],
            'download_label' => 'Unduh Panduan Lengkap SIINas',
            'download_file' => 'aset_download/File Layanan Disperdagin SIINas.pdf',
            'flowchart' => 'images/flowchart_sinas.png',
        ];

        $page = SitePage::query()->where('slug', 'layanan/sinas')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'SIINas',
                'slug' => 'layanan/sinas',
                'group' => 'Layanan',
                'eyebrow' => 'Layanan',
                'image' => 'images/flowchart_sidangtera.png',
                'excerpt' => 'Informasi prosedur SIINas.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['sinas_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateLayananSinas(Request $request)
    {
        $page = SitePage::query()->where('slug', 'layanan/sinas')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'sinas_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['sinas_data'])) {
            $updateData['content'] = json_encode($validated['sinas_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['sinas_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function layananTera()
    {
        $defaults = [
            'intro' => 'Tata Cara Pendaftaran Tera/Tera Ulang',
            'description' => 'Persyaratan yang dibutuhkan :',
            'requirements' => [
                'Data Nama Usaha',
                'Lokasi Usaha',
                'Surat Permohonan',
                'Alat UTTP',
                'Fotocopy KTP',
                'Nomor Hp',
                'Booking Tera',
            ],
            'download_label' => 'Unduh Panduan Lengkap Tera/Tera Ulang',
            'download_file' => 'aset_download/File Layanan Disperdagin TERA.pdf',
            'booking_label' => 'Booking Tera',
            'booking_url' => 'https://docs.google.com/forms/d/e/1FAIpQLSebipggAPdH7eIew2qQNZGRM3z4Ty4x9GidBEvYPp8VoxJ1yw/viewform',
            'flowchart1_title' => 'Langkah - Langkah Tera/Tera Ulang Di Kantor dan Di Tempat',
            'flowchart1' => 'images/flowchart_tera1.png',
            'flowchart2_title' => 'Sidang Tera Ulang Di Kantor',
            'flowchart2' => 'images/flowchart_tera2.png',
        ];

        $page = SitePage::query()->where('slug', 'layanan/tera')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Tera / Tera Ulang',
                'slug' => 'layanan/tera',
                'group' => 'Layanan',
                'eyebrow' => 'Layanan',
                'image' => 'images/flowchart_sidangtera.png',
                'excerpt' => 'Informasi prosedur tera dan tera ulang.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['tera_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateLayananTera(Request $request)
    {
        $page = SitePage::query()->where('slug', 'layanan/tera')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'tera_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['tera_data'])) {
            $updateData['content'] = json_encode($validated['tera_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['tera_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function layananTdg()
    {
        $defaults = [
            'intro' => 'Tata Cara Pendaftaran Tanda Daftar Gudang',
            'description' => 'Persyaratan yang dibutuhkan :',
            'requirements' => [
                'KTP Asli',
                'NPWP',
                'Nomor BPJS Ketenagakerjaan (Jika ada)',
                'Nomor BPJS Kesehatan (Jika ada)',
                'NIB',
                'Sertifikasi Gudang',
                'IMB/PBG (Persetujuan Bagunan Gedung)',
            ],
            'download_label' => 'Unduh Panduan Lengkap Tanda Daftar Gudang',
            'download_file' => 'aset_download/File Layanan Disperdagin TDG.pdf',
            'flowchart' => 'images/flowchart_tdg.png',
        ];

        $page = SitePage::query()->where('slug', 'layanan/td-gudang')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Tanda Daftar Gudang',
                'slug' => 'layanan/td-gudang',
                'group' => 'Layanan',
                'eyebrow' => 'Layanan',
                'image' => 'images/flowchart_sidangtera.png',
                'excerpt' => 'Informasi prosedur tanda daftar gudang.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['tdg_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateLayananTdg(Request $request)
    {
        $page = SitePage::query()->where('slug', 'layanan/td-gudang')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'tdg_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['tdg_data'])) {
            $updateData['content'] = json_encode($validated['tdg_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['tdg_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function layananMinhol()
    {
        $defaults = [
            'intro' => 'Tata Cara Pendaftaran Perpanjangan Minuman Beralkohol',
            'description' => 'Persyaratan yang dibutuhkan :',
            'requirements' => [
                'Scan Nomor Induk Berusaha (NIB) dan lampirannya',
                'Scan KTP/Pasport Asli Pemilik atau Penanggung Jawab',
                'Scan Akte Pendirian / Perubahan Perusahaan yang telah disahkan instansi terkait (Perseroan Terbatas (PT), Koperasi)',
                'Scan Asli Nomor Pokok Wajib Pajak (kecuali usaha mikro)',
                'Scan Izin Usaha Perdagangan atau Tanda Daftar Usaha Pariwisata yang Diterbitkan oleh OSS',
                'Surat penunjukan dari sub distributor sebagai pengecer atau penjual langsung',
                'Scan Asli Lunas Pajak Bumi dan Bangunan (PBB) terbaru',
                'Scan SIUP MB Asli (bagi Perpanjangan)',
                'Rencana Penjualan Minuman Beralkohol 1 tahun kedepan',
                'Pas Foto (1/2 Badan) Berwarna 4 x 6 dengan latar belakang Merah atau Biru (Formal)',
                'Scan NPPBKC',
            ],
            'download_label' => 'Unduh Panduan Lengkap Perpanjangan Minuman Beralkohol',
            'download_file' => 'aset_download/File Layanan Disperdagin MINHOL.pdf',
            'flowchart' => 'images/flowchart_minhol.png',
        ];

        $page = SitePage::query()->where('slug', 'layanan/minhol')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Perpanjangan Minuman Beralkohol',
                'slug' => 'layanan/minhol',
                'group' => 'Layanan',
                'eyebrow' => 'Layanan',
                'image' => 'images/flowchart_sidangtera.png',
                'excerpt' => 'Informasi perpanjangan minuman beralkohol.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['minhol_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateLayananMinhol(Request $request)
    {
        $page = SitePage::query()->where('slug', 'layanan/minhol')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'minhol_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['minhol_data'])) {
            $updateData['content'] = json_encode($validated['minhol_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['minhol_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function zonaIntegritas()
    {
        $defaults = [
            'hero_title' => 'Zona Integritas',
            'hero_subtitle' => 'DISPERDAGIN Kota Kediri',
            'about_title' => 'Apa itu Zona Integritas?',
            'about_text' => 'Zona Integritas adalah predikat yang diberikan kepada instansi pemerintah yang pimpinan beserta jajarannya mempunyai komitmen untuk mewujudkan Wilayah Bebas Korupsi (WBK) atau Wilayah Birokrasi Bersih Melayani (WBBM) melalui reformasi birokrasi, khususnya dalam hal pencegahan korupsi dan peningkatan kualitas pelayanan publik.',
            'about_image' => 'images/tandatanya.webp',
            'buttons' => [
                ['label' => 'Manajemen Perubahan', 'image' => 'images/mnj-perubahan.webp', 'url' => '/zona-integritas/mnj-perubahan'],
                ['label' => 'Tata Laksana', 'image' => 'images/tata-laksana.webp', 'url' => '/zona-integritas/tata-laksana'],
                ['label' => 'Manajemen SDM', 'image' => 'images/mnj-sdm.webp', 'url' => '/zona-integritas/mnj-sdm'],
                ['label' => 'Akuntabilitas', 'image' => 'images/akuntabilitas.webp', 'url' => '/zona-integritas/akuntabilitas'],
                ['label' => 'Pengawasan', 'image' => 'images/pengawasan.webp', 'url' => '/zona-integritas/pengawasan'],
                ['label' => 'Pelayanan Publik', 'image' => 'images/pelayanan-publik.webp', 'url' => '/zona-integritas/pelayanan-publik'],
            ],
        ];

        $page = SitePage::query()->where('slug', 'zona-integritas')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Zona Integritas',
                'slug' => 'zona-integritas',
                'group' => 'Zona Integritas',
                'eyebrow' => 'Reformasi Birokrasi',
                'image' => 'images/zona-integritas.webp',
                'excerpt' => 'Komitmen Zona Integritas.',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['zi_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateZonaIntegritas(Request $request)
    {
        $page = SitePage::query()->where('slug', 'zona-integritas')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'zi_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['zi_data'])) {
            $updateData['content'] = json_encode($validated['zi_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['zi_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
    }

    public function programKegiatan()
    {
        $defaults = [
            'intro' => 'Program Kerja Dinas DISPERDAGIN Kota Kediri',
            'programs' => [
                ['number' => 1, 'title' => 'Program Pengembangan Ekspor', 'desc' => 'Untuk meningkatkan kemampuan dan kapasitas eksportir, terutama dari sektor usaha kecil dan menengah (UKM), dalam menembus pasar internasional.'],
                ['number' => 2, 'title' => 'Program Penggunaan Dan Pemasaran Produk Dalam Negeri', 'desc' => 'Untuk mendorong konsumsi dan distribusi produk-produk yang dibuat di dalam negeri.'],
                ['number' => 3, 'title' => 'Program Standardisasi Dan Perlindungan Konsumen', 'desc' => 'Untuk memastikan bahwa produk dan layanan yang beredar di pasar memenuhi standar kualitas tertentu dan aman digunakan oleh konsumen.'],
                ['number' => 4, 'title' => 'Program Perizinan Dan Pendaftaran Perusahaan', 'desc' => 'Untuk meningkatkan efisiensi dan transparansi dalam pengurusan izin usaha dan pendaftaran perusahaan.'],
                ['number' => 5, 'title' => 'Program Peningkatan Sarana Distribusi Perdagangan', 'desc' => 'Untuk memperbaiki dan mengembangkan infrastruktur serta fasilitas yang mendukung kegiatan distribusi perdagangan.'],
                ['number' => 6, 'title' => 'Program Pengendalian Izin Usaha Industri Kabupaten/Kota', 'desc' => 'Untuk mengatur dan mengawasi pemberian izin usaha industri di tingkat kabupaten atau kota.'],
                ['number' => 7, 'title' => 'Program Pengelolaan Sistem Informasi Industri Nasional', 'desc' => 'Untuk mengembangkan dan mengelola sistem informasi yang komprehensif dan terintegrasi mengenai industri nasional.'],
                ['number' => 8, 'title' => 'Program Perencanaan Dan Pembangunan Industri', 'desc' => 'Untuk mengembangkan sektor industri melalui perencanaan yang strategis dan pelaksanaan proyek pembangunan industri.'],
                ['number' => 9, 'title' => 'Program Stabilisasi Harga Barang Kebutuhan Pokok Dan Barang Penting', 'desc' => 'Untuk menjaga kestabilan harga barang-barang kebutuhan dasar dan penting bagi masyarakat, seperti beras, gula, minyak goreng, dan bahan bakar.'],
            ],
        ];

        $page = SitePage::query()->where('slug', 'program-kegiatan')->first();
        if (!$page) {
            $page = SitePage::create([
                'title' => 'Program Kegiatan',
                'slug' => 'program-kegiatan',
                'group' => 'Profil',
                'eyebrow' => 'Profil',
                'image' => 'images/Notebook.png',
                'is_published' => true,
                'content' => json_encode($defaults),
            ]);
        }
        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['program_data'] = is_array($parsed) ? $parsed : $defaults;
        return response()->json(['status' => 'success', 'data' => $data]);
    }

    public function updateProgramKegiatan(Request $request)
    {
        $page = SitePage::query()->where('slug', 'program-kegiatan')->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:180'],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'program_data' => ['nullable', 'array'],
        ]);

        $updateData = [];
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (array_key_exists('eyebrow', $validated)) {
            $updateData['eyebrow'] = $validated['eyebrow'];
        }
        if (isset($validated['program_data'])) {
            $updateData['content'] = json_encode($validated['program_data']);
        }

        $page->update($updateData);
        $result = $page->fresh()->toArray();
        $result['program_data'] = json_decode($page->content, true) ?? [];

        return response()->json(['status' => 'success', 'data' => $result]);
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

    public function banners(Request $request)
    {
        if ($request->isMethod('get')) {
            return response()->json(['status' => 'success', 'data' => SiteBanner::query()->orderBy('sort_order')->get()]);
        }
        return response()->json(['status' => 'success', 'data' => SiteBanner::create($request->validate($this->bannerRules()))], 201);
    }

    public function updateBanner(Request $request, SiteBanner $banner)
    {
        $banner->update($request->validate($this->bannerRules(true)));
        return response()->json(['status' => 'success', 'data' => $banner->fresh()]);
    }

    public function destroyBanner(SiteBanner $banner)
    {
        $banner->delete();
        return response()->json(['status' => 'success']);
    }

    public function upload(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:5120'],
        ]);

        $file = $request->file('file');
        $ext = $file->getClientOriginalExtension();
        $name = Str::random(20) . '.' . $ext;
        $path = $file->storeAs('uploads', $name, 'public_assets');

        return response()->json([
            'status' => 'success',
            'data' => ['path' => str_replace('\\', '/', $path)],
        ]);
    }

    public function users(Request $request)
    {
        if ($request->isMethod('get')) {
            $rows = User::query()
                ->select('user_id as id', 'name', 'username', 'email', 'user_role')
                ->orderBy('name')
                ->get();
            return response()->json(['status' => 'success', 'data' => $rows]);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['nullable', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'user_role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_SURVEYOR])],
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->user_id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'user_role' => $user->user_role,
            ],
        ], 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'username' => ['sometimes', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->user_id, 'user_id')],
            'email' => ['nullable', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->user_id, 'user_id')],
            'password' => ['nullable', 'string', 'min:6'],
            'user_role' => ['sometimes', Rule::in([User::ROLE_ADMIN, User::ROLE_SURVEYOR])],
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->user_id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'user_role' => $user->user_role,
            ],
        ]);
    }

    public function destroyUser(User $user)
    {
        if ($user->user_id === request()->user()->user_id) {
            return response()->json(['status' => 'error', 'message' => 'Tidak bisa menghapus akun sendiri.'], 422);
        }
        $user->delete();
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

    public function exportPricesAggregated(Request $request)
    {
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date', now()->format('Y-m-d'));

        // Get daily average price per commodity across all Pasar Rakyat
        $dailyAvgs = CommodityPriceRecord::query()
            ->join('pasars', 'pasars.id', '=', 'commodity_price_records.pasar_id')
            ->join('komoditas', 'komoditas.id', '=', 'commodity_price_records.komoditas_id')
            ->where('pasars.category', 'Pasar Rakyat')
            ->whereBetween('price_date', [$startDate ?? '1900-01-01', $endDate])
            ->select(
                'commodity_price_records.komoditas_id',
                'komoditas.name as komoditas',
                'komoditas.unit',
                'price_date',
                DB::raw('ROUND(AVG(commodity_price_records.price)) as avg_price')
            )
            ->groupBy('commodity_price_records.komoditas_id', 'price_date', 'komoditas.name', 'komoditas.unit')
            ->orderBy('komoditas.name')
            ->orderBy('price_date')
            ->get();

        // Get reference prices (HET/HAP) for indicator logic
        $references = DB::table('het_hap_settings')
            ->whereNull('pasar_id')
            ->where('is_active', true)
            ->pluck('price', 'komoditas_id');

        $grouped = $dailyAvgs->groupBy('komoditas_id');
        $rows = [];

        foreach ($grouped as $komoditasId => $items) {
            $sortedItems = $items->sortBy('price_date')->values();
            $rataRataPeriode = (int) round($items->avg('avg_price'));
            $reference = isset($references[$komoditasId]) ? (int) $references[$komoditasId] : null;
            $dates = [];

            foreach ($sortedItems as $idx => $item) {
                $hargaSekarang = (int) $item->avg_price;
                // Previous price: use the previous day's avg for this commodity
                $prev = ($idx > 0) ? (int) $sortedItems[$idx - 1]->avg_price : 0;
                $selisih = $hargaSekarang - $prev;

                // Indicator: compare current average price to HET/HAP reference
                $indikator = 'Belum Dikaji';
                if ($reference) {
                    if ($hargaSekarang <= $reference) {
                        $indikator = 'Aman';
                    } elseif ($hargaSekarang <= round($reference * 1.10)) {
                        $indikator = 'Waspada';
                    } else {
                        $indikator = 'Intervensi';
                    }
                }

                $dates[] = (object) [
                    'price_date' => $item->price_date,
                    'komoditas' => $item->komoditas,
                    'unit' => $item->unit,
                    'harga_sekarang' => $hargaSekarang,
                    'harga_kemarin' => $prev,
                    'selisih' => $selisih,
                    'rata_rata' => $rataRataPeriode,
                    'indikator' => $indikator,
                ];
            }

            $rows = array_merge($rows, $dates);
        }

        // Sort by commodity name, then by date
        usort($rows, fn ($a, $b) => $a->komoditas === $b->komoditas
            ? strcmp($a->price_date, $b->price_date)
            : strcmp($a->komoditas, $b->komoditas));

        $filename = 'harga-komoditas-rekap-'.now()->format('Ymd-His').'.xls';
        $html = view('exports.prices-avg', [
            'rows' => $rows,
            'dateFrom' => $startDate,
            'dateTo' => $endDate,
        ])->render();
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
            'category' => ['nullable', 'string', 'max:80', Rule::in(Pasar::CATEGORIES)],
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
            'external_url' => ['nullable', 'string', 'max:255'],
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
            'category' => [$req, 'string', 'max:80', Rule::in(DownloadDocument::CATEGORIES)],
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

    private function ikmRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'name' => [$req, 'string', 'max:180'],
            'category' => [$req, 'string', 'in:' . implode(',', Ikm::CATEGORIES)],
            'owner' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'kelurahan' => ['nullable', 'string', 'max:120'],
            'contact' => ['nullable', 'string', 'max:120'],
            'location' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'show_contact' => ['nullable', 'boolean'],
            'show_address' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    private function bannerRules(bool $partial = false): array
    {
        $req = $partial ? 'sometimes' : 'required';
        return [
            'title' => ['nullable', 'string', 'max:180'],
            'image' => [$req, 'string', 'max:255'],
            'link_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
