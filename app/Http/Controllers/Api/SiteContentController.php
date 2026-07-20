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

    public function ikm()
    {
        $data = \App\Models\Ikm::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'owner' => $item->owner,
                'description' => $item->description,
                'address' => $item->show_address ? $item->address : null,
                'kelurahan' => $item->kelurahan,
                'contact' => $item->show_contact ? $item->contact : null,
                'location' => $item->location,
                'image' => $item->image,
            ]);

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

        $page = SitePage::query()
            ->where('slug', 'layanan/halal')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['halal_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'layanan/merk')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['merk_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'layanan/sinas')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['sinas_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'layanan/tera')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['tera_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'layanan/td-gudang')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['tdg_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'layanan/minhol')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['minhol_data'] = is_array($parsed) ? $parsed : $defaults;

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
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

        $page = SitePage::query()
            ->where('slug', 'zona-integritas')
            ->where('is_published', true)
            ->first();

        if (!$page) {
            abort(404, 'Halaman tidak ditemukan.');
        }

        $data = $page->toArray();
        $parsed = json_decode($page->content, true);
        $data['zi_data'] = is_array($parsed) ? $parsed : $defaults;

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
