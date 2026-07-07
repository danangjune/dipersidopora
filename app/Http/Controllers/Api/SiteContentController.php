<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DownloadDocument;
use App\Models\Komoditas;
use App\Models\Pasar;
use App\Models\Pedagang;
use App\Models\SiteBanner;
use App\Models\SitePage;
use App\Models\SiteSetting;
use App\Models\SurveySetting;

class SiteContentController extends Controller
{
    public function page(string $slug)
    {
        $slug = trim($slug, '/');
        $slug = str_replace('_', '-', $slug);
        $slug = preg_replace('/\.php$/', '', $slug);

        $aliases = [
            'programkegiatan' => 'program-kegiatan',
            'td-gudang' => 'layanan/td-gudang',
            'tdgudang' => 'layanan/td-gudang',
            'halal' => 'layanan/halal',
            'merk' => 'layanan/merk',
            'sinas' => 'layanan/sinas',
            'tera' => 'layanan/tera',
            'minhol' => 'layanan/minhol',
            'contact' => 'kontak',
            'maintance' => 'maintenance',
        ];

        $slug = $aliases[$slug] ?? $slug;

        $page = SitePage::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (! $page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();

        if ($slug === 'pasar') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->where('category', 'Pasar Rakyat')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'pasar-modern') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->where('category', 'Pasar Modern')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'minimarket') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->where('category', 'Minimarket')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'mall') {
            $data['cards'] = Pasar::query()
                ->where('is_active', true)
                ->whereIn('category', ['Mall', 'Pusat Perbelanjaan'])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => $item->address ?: $item->category,
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'komoditas') {
            $data['cards'] = Komoditas::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get()
                ->map(fn($item) => [
                    'title' => $item->name,
                    'text' => 'Satuan: ' . ($item->unit ?: '-'),
                    'image' => $item->image,
                ])
                ->values();
        }

        if ($slug === 'pedagang') {
            $total = Pedagang::count();
            $valid = Pedagang::where('status_validasi', 'true')->count();
            $pending = Pedagang::where('status_validasi', 'pending')->count();

            $data['cards'] = [
                [
                    'title' => 'Total Pedagang',
                    'text' => "{$total} data pedagang terdaftar",
                ],
                [
                    'title' => 'Tervalidasi',
                    'text' => "{$valid} data sudah tervalidasi",
                ],
                [
                    'title' => 'Menunggu Validasi',
                    'text' => "{$pending} data menunggu validasi",
                ],
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

    public function banners()
    {
        $items = SiteBanner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function services()
    {
        $items = SitePage::query()
            ->where('group', 'Layanan')
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->orderBy('title')
            ->get(['id', 'title', 'slug', 'excerpt', 'content', 'image', 'external_url']);
        return response()->json(['status' => 'success', 'data' => $items]);
    }

    public function pasar()
    {
        $page = SitePage::query()
            ->where('slug', 'pasar')
            ->where('is_published', true)
            ->first();

        $markets = Pasar::query()
            ->where('is_active', true)
            ->where('category', 'Pasar Rakyat')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'address' => $item->address,
                'image' => $item->image,
                'latitude' => $item->latitude,
                'longitude' => $item->longitude,
            ])
            ->values();

        $data = $page ? $page->toArray() : [];
        $data['markets'] = $markets;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function pasarModern()
    {
        $page = SitePage::query()
            ->where('slug', 'pasar-modern')
            ->where('is_published', true)
            ->first();

        $markets = Pasar::query()
            ->where('is_active', true)
            ->whereIn('category', ['Minimarket', 'Pusat Perbelanjaan'])
            ->orderBy('category')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'address' => $item->address,
                'image' => $item->image,
                'latitude' => $item->latitude,
                'longitude' => $item->longitude,
            ])
            ->values();

        $data = $page ? $page->toArray() : [];
        $data['markets'] = $markets;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function mall()
    {
        $page = SitePage::query()
            ->where('slug', 'mall')
            ->where('is_published', true)
            ->first();

        $markets = Pasar::query()
            ->where('is_active', true)
            ->whereIn('category', ['Pusat Perbelanjaan', 'Mall'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'address' => $item->address,
                'image' => $item->image,
                'latitude' => $item->latitude,
                'longitude' => $item->longitude,
            ])
            ->values();

        $data = $page ? $page->toArray() : [];
        $data['markets'] = $markets;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'program-kegiatan')
            ->where('is_published', true)
            ->first();

        if (! $page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['program_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'tentang')
            ->where('is_published', true)
            ->first();

        if (! $page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['tentang_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function settings()
    {
        $items = SiteSetting::query()->pluck('value', 'key');
        return response()->json(['status' => 'success', 'data' => $items]);
    }
}
