<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('tb_counter')->updateOrInsert(['id' => 1], ['counts' => 0, 'created_at' => now(), 'updated_at' => now()]);

        DB::table('users')->updateOrInsert(['username' => 'admin'], [
            'name' => 'Administrator', 'user_firstname' => 'Admin', 'user_lastname' => 'Disperdagin', 'email' => 'admin@example.test',
            'password' => Hash::make('Admin#12345'), 'user_password' => Hash::make('Admin#12345'), 'user_role' => 'admin', 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('login_pkl')->updateOrInsert(['username' => 'admin'], ['password' => Hash::make('Admin#12345'), 'role' => 'admin', 'created_at' => now(), 'updated_at' => now()]);

        $marketSeeds = [
            ['Pasar Bandar', 'Pasar Rakyat', 'images/pasar/pasar bandar.jpg'], ['Pasar Pahing', 'Pasar Rakyat', 'images/pasar/pahing.jpg'], ['Pasar Setono Betek', 'Pasar Rakyat', 'images/pasar/pasar setonobetek.jpg'],
            ['Pasar Banjaran', 'Pasar Rakyat', 'images/pasar/pasar banjaran.jpg'], ['Pasar Grosir Ngronggo', 'Pasar Rakyat', 'images/pasar/Pasar Grosir Ngronggo.jpg'], ['Pasar Mojoroto', 'Pasar Rakyat', 'images/pasar/Pasar Mojoroto.jpg'], ['Pasar Campurejo', 'Pasar Rakyat', 'images/pasar/Pasar Campurejo.jpg'],
        ];
        foreach ($marketSeeds as $idx => [$name, $category, $image]) {
            DB::table('pasars')->updateOrInsert(['slug' => Str::slug($name)], ['name' => $name, 'category' => $category, 'image' => $image, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]);
        }

        $commodities = [
            ['Beras', 'beras.webp', 13000, 12800, 'kg'], ['Beras Medium', 'beras_medium.webp', 12500, 12600, 'kg'], ['Gula Pasir', 'gula_pasir.webp', 17000, 17000, 'kg'], ['Minyak Goreng Curah', 'minyak_curah.webp', 16500, 16800, 'liter'], ['Minyakita', 'minyakita.webp', 15500, 15500, 'liter'],
            ['Telur Ayam Ras', 'telur_ras.webp', 28000, 27500, 'kg'], ['Daging Ayam Ras', 'ayam_ras.webp', 36000, 36000, 'kg'], ['Daging Sapi', 'daging.webp', 115000, 114000, 'kg'], ['Bawang Merah', 'bamer.webp', 34000, 33000, 'kg'], ['Bawang Putih', 'baput.webp', 36000, 35000, 'kg'],
            ['Cabai Rawit', 'cabe_rawit.webp', 42000, 39000, 'kg'], ['Cabai Merah', 'cabe_merah.webp', 38000, 37500, 'kg'], ['Tomat', 'tomat.webp', 12000, 13000, 'kg'], ['Kentang', 'kentang.webp', 18000, 18000, 'kg'], ['Wortel', 'wortel.webp', 16000, 16500, 'kg'],
        ];
        foreach ($commodities as $idx => [$name, $image, $today, $yesterday, $unit]) {
            DB::table('komoditas')->updateOrInsert(['slug' => Str::slug($name)], ['name' => $name, 'unit' => $unit, 'image' => $image, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]);
        }

        $markets = DB::table('pasars')->pluck('id', 'slug');
        $commodityRows = DB::table('komoditas')->get();
        foreach ($markets as $marketSlug => $marketId) {
            foreach ($commodityRows as $idx => $commodity) {
                $base = $commodities[$idx % count($commodities)][2] ?? 10000;
                for ($d = 0; $d < 7; $d++) {
                    $date = now()->subDays(6 - $d)->toDateString();
                    $price = max(1000, (int) ($base + (($idx % 4) * 250) + ($d * 100) + (strlen($marketSlug) % 5 * 75)));
                    $prev = max(1000, $price - ((($idx + $d) % 3) * 150));
                    DB::table('commodity_price_records')->updateOrInsert(
                        ['pasar_id' => $marketId, 'komoditas_id' => $commodity->id, 'price_date' => $date],
                        ['price' => $price, 'previous_price' => $prev, 'unit' => $commodity->unit, 'status_validasi' => 'true', 'indicator_status' => 'belum_dikaji', 'created_at' => now(), 'updated_at' => now()]
                    );
                }
            }
        }

        foreach ($commodityRows as $commodity) {
            DB::table('het_hap_settings')->updateOrInsert(['komoditas_id' => $commodity->id, 'pasar_id' => null, 'type' => 'HAP'], ['price' => (int) (DB::table('commodity_price_records')->where('komoditas_id', $commodity->id)->avg('price') ?: 0), 'effective_date' => now()->toDateString(), 'is_active' => true, 'notes' => 'Sementara disamakan dengan konsep ESDEGAN; rumus indikator dapat dikaji ulang.', 'created_at' => now(), 'updated_at' => now()]);
        }

        

        $pages = [
            ['Profil Dinas','tentang','Tentang DISPERDAGIN','Profil','images/office.png','Profil Dinas Perdagangan dan Perindustrian Kota Kediri.'],
            ['Struktur Organisasi','struktur','Tentang','Profil','images/struktur-organisasi (1).png','Struktur organisasi DISPERDAGIN Kota Kediri.'],
            ['Program Kegiatan','program-kegiatan','Tentang','Profil','images/Notebook.png','Program dan kegiatan dinas.'],
            ['Informasi Pasar Rakyat','pasar','Informasi','Informasi','images/pasar.jpeg','Data pasar rakyat.'],
            ['Informasi Pasar Modern','pasar-modern','Informasi','Informasi','images/supermarket.jpeg','Data pasar modern dan supermarket.'],
            ['Informasi Minimarket','minimarket','Informasi','Informasi','images/supermarket.jpeg','Data minimarket.'],
            ['Informasi Pusat Perbelanjaan','mall','Informasi','Informasi','images/mall.jpeg','Data pusat perbelanjaan.'],
            ['Informasi Industri Kecil Menengah','ikm','Informasi','Informasi','images/industri.jpeg','Informasi IKM.'],
            ['Peraturan','peraturan','Informasi','Informasi','images/SealCheck.png','Daftar peraturan.'],
            ['Galeri','galeri','Publikasi','Publikasi','images/galeri/Halal-bihalal.jpg','Album kegiatan.'],
            ['Kontak','kontak','Kontak','Profil','images/office.png','Kontak DISPERDAGIN.'],
            ['Form Booking Tera','form-booking-tera','Layanan','Layanan','images/flowchart_sidangtera.png','Booking tera.'],
            ['Zona Integritas','zona-integritas','Reformasi Birokrasi','Zona Integritas','images/zona-integritas.webp','Komitmen Zona Integritas.'],
            ['Manajemen Perubahan','mnj-perubahan','Zona Integritas','Zona Integritas','images/mnj-perubahan.webp','Area manajemen perubahan.'],
            ['Penataan Tata Laksana','tata-laksana','Zona Integritas','Zona Integritas','images/tata-laksana.webp','Area tata laksana.'],
            ['Penataan Manajemen SDM','mnj-sdm','Zona Integritas','Zona Integritas','images/mnj-sdm.webp','Area manajemen SDM.'],
            ['Penguatan Akuntabilitas','akuntabilitas','Zona Integritas','Zona Integritas','images/akuntabilitas.webp','Area akuntabilitas.'],
            ['Penguatan Pengawasan','pengawasan','Zona Integritas','Zona Integritas','images/pengawasan.webp','Area pengawasan.'],
            ['Peningkatan Kualitas Pelayanan Publik','pelayanan-publik','Zona Integritas','Zona Integritas','images/pelayanan-publik.webp','Area pelayanan publik.'],
            ['Maintenance','maintenance','Informasi','Informasi','images/tandatanya.webp','Halaman maintenance.'],
        ];
        foreach ($pages as $idx => [$title, $slug, $eyebrow, $group, $image, $excerpt]) {
            DB::table('site_pages')->updateOrInsert(['slug' => $slug], ['title' => $title, 'eyebrow' => $eyebrow, 'group' => $group, 'image' => $image, 'excerpt' => $excerpt, 'content' => $excerpt."\nKonten ini dapat diubah dari Admin Page tanpa mengedit file kode.", 'is_published' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]);
        }

        $downloads = [
            ['RENSTRA DISPERDAGIN Tahun 2025-2026','renstra','aset_download/RENSTRA DISPERDAGIN TAHUN 2025-2026.pdf'], ['Dokumen RENSTRA DISPERDAGIN 2024','renstra','aset_download/Dokumen RENSTRA DISPERDAGIN 2024.pdf'],
            ['Dokumen Renja Disperdagin 2023','renja','aset_download/Dokumen Renja Disperdagin 2023.pdf'], ['Dokumen Renja Disperdagin 2024','renja','aset_download/Dokumen Renja Disperdagin 2024.pdf'], ['Dokumen Renja Disperdagin 2025','renja','aset_download/20240911 Dokumen Renja Disperdagin 2025.pdf'],
            ['Dokumen LKjIP Disperdagin 2022','laporan','aset_download/Dokumen LKjIP Disperdagin 2022.pdf'], ['Dokumen LKjIP Disperdagin 2023','laporan','aset_download/Dokumen LKjIP Disperdagin 2023.pdf'], ['LKJPD Disperdagin 2024','laporan','aset_download/LKJPD Disperdagin 2024_Bab I & IV_Final TTE.pdf'],
            ['File Layanan Disperdagin','layanan','aset_download/File Layanan Disperdagin.pdf'], ['File Layanan Halal','layanan','aset_download/File Layanan Disperdagin Halal.pdf'], ['File Layanan Merk','layanan','aset_download/File Layanan Disperdagin Merk.pdf'], ['File Layanan SIINas','layanan','aset_download/File Layanan Disperdagin SIINas.pdf'], ['File Layanan TDG','layanan','aset_download/File Layanan Disperdagin TDG.pdf'], ['File Layanan TERA','layanan','aset_download/File Layanan Disperdagin TERA.pdf'],
        ];
        foreach ($downloads as $idx => [$title, $category, $filePath]) {
            DB::table('download_documents')->updateOrInsert(['title' => $title, 'category' => $category], ['file_path' => $filePath, 'is_published' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]);
        }

        DB::table('survey_settings')->updateOrInsert(['title' => 'Survey Kepuasan Masyarakat'], ['external_url' => null, 'qr_image' => 'images/IKM survey 1.png', 'description' => 'Survey mengacu pada SKM dari KemenPANRB. Link dan barcode dapat diganti melalui Admin Page.', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
    }
}
