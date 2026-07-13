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

        DB::table('users')->updateOrInsert(['username' => 'surveyor'], [
            'name' => 'Surveyor Pasar', 'user_firstname' => 'Surveyor', 'user_lastname' => 'Pasar', 'email' => 'surveyor@example.test',
            'password' => Hash::make('Surveyor#12345'), 'user_password' => Hash::make('Surveyor#12345'), 'user_role' => 'surveyor', 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('login_pkl')->updateOrInsert(['username' => 'admin'], ['password' => Hash::make('Admin#12345'), 'role' => 'admin', 'created_at' => now(), 'updated_at' => now()]);

        $marketSeeds = [
            // Pasar Rakyat
            ['Pasar Bandar', 'Pasar Rakyat', 'images/pasar/pasar bandar.jpg', 'Jl. Dhoho, Bandar Lor, Kec. Mojoroto', -7.8173, 112.0169],
            ['Pasar Pahing', 'Pasar Rakyat', 'images/pasar/pahing.jpg', 'Jl. Pahing, Setono Pande, Kec. Kediri', -7.8145, 112.0105],
            ['Pasar Setono Betek', 'Pasar Rakyat', 'images/pasar/pasar setonobetek.jpg', 'Jl. Setono Betek, Kec. Kediri', -7.8189, 112.0142],
            ['Pasar Banjaran', 'Pasar Rakyat', 'images/pasar/pasar banjaran.jpg', 'Jl. Banjaran, Kec. Kota Kediri', -7.8210, 112.0185],
            ['Pasar Grosir Ngronggo', 'Pasar Rakyat', 'images/pasar/Pasar Grosir Ngronggo.jpg', 'Jl. Raya Ngronggo, Kec. Kediri', -7.8102, 112.0089],
            ['Pasar Mojoroto', 'Pasar Rakyat', 'images/pasar/Pasar Mojoroto.jpg', 'Jl. Mojoroto, Kec. Mojoroto', -7.8255, 112.0210],
            ['Pasar Campurejo', 'Pasar Rakyat', 'images/pasar/Pasar Campurejo.jpg', 'Jl. Campurejo, Kec. Mojoroto', -7.8230, 112.0195],
            // Minimarket
            ['Indomaret Bandar Lor', 'Minimarket', null, 'Jl. Penanggungan No. 10, Bandar Lor, Kec. Mojoroto', -7.8160, 112.0175],
            ['Indomaret Mojoroto', 'Minimarket', null, 'Jl. Mojoroto No. 25, Mojoroto, Kec. Mojoroto', -7.8260, 112.0205],
            ['Indomaret Ketami', 'Minimarket', null, 'Jl. Ketami, Kec. Kediri', -7.8120, 112.0110],
            ['Alfamart Bandar Lor', 'Minimarket', null, 'Jl. Penanggungan No. 50, Bandar Lor, Kec. Mojoroto', -7.8165, 112.0180],
            ['Alfamart Mojoroto', 'Minimarket', null, 'Jl. Mojoroto No. 80, Mojoroto, Kec. Mojoroto', -7.8250, 112.0215],
            ['Alfamart Ngronggo', 'Minimarket', null, 'Jl. Raya Ngronggo No. 15, Kec. Kediri', -7.8108, 112.0085],
            ['Alfamidi Kediri', 'Minimarket', null, 'Jl. Dhoho No. 88, Bandar Lor, Kec. Mojoroto', -7.8178, 112.0162],
            ['Tsamania Supermarket', 'Minimarket', null, 'Jl. Panglima Sudirman, Kec. Kediri', -7.8135, 112.0130],
            ['Mekarmart Kediri', 'Minimarket', null, 'Jl. Veteran No. 15, Kec. Mojoroto', -7.8200, 112.0155],
            // Pusat Perbelanjaan
            ['Pusat Perbelanjaan Dhoho Plaza', 'Pusat Perbelanjaan', null, 'Jl. Dhoho No. 1, Bandar Lor, Kec. Mojoroto', -7.8170, 112.0170],
            ['Pusat Perbelanjaan Kediri Mall', 'Pusat Perbelanjaan', null, 'Jl. Veteran No. 100, Kec. Mojoroto', -7.8205, 112.0160],
        ];
        foreach ($marketSeeds as $idx => [$name, $category, $image, $address, $lat, $lng]) {
            DB::table('pasars')->updateOrInsert(['slug' => Str::slug($name)], ['name' => $name, 'category' => $category, 'image' => $image, 'address' => $address, 'latitude' => $lat, 'longitude' => $lng, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]);
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
            DB::table('het_hap_settings')->updateOrInsert(['komoditas_id' => $commodity->id, 'pasar_id' => null], ['price' => (int) (DB::table('commodity_price_records')->where('komoditas_id', $commodity->id)->avg('price') ?: 0), 'effective_date' => now()->toDateString(), 'is_active' => true, 'notes' => 'Sementara disamakan dengan konsep ESDEGAN; rumus indikator dapat dikaji ulang.', 'created_at' => now(), 'updated_at' => now()]);
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

        DB::table('site_pages')->updateOrInsert(['slug' => 'bantuan-modal'], ['title' => 'Bantuan Modal', 'eyebrow' => 'Layanan', 'group' => 'Layanan', 'external_url' => 'https://sultan.kedirikota.go.id/', 'excerpt' => 'Informasi bantuan modal dan penguatan usaha masyarakat.', 'is_published' => true, 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()]);

        $servicePages = [
            ['Sertifikasi Halal','layanan/halal','Layanan','Layanan','images/flowchart_sidangtera.png','Informasi prosedur sertifikasi halal.'],
            ['Legalitas Merk','layanan/merk','Layanan','Layanan','images/flowchart_sidangtera.png','Informasi prosedur legalitas merk.'],
            ['SIINas','layanan/sinas','Layanan','Layanan','images/flowchart_sidangtera.png','Informasi prosedur SIINas.'],
            ['Tera / Tera Ulang','layanan/tera','Layanan','Layanan','images/flowchart_sidangtera.png','Informasi prosedur tera dan tera ulang.'],
            ['Tanda Daftar Gudang','layanan/td-gudang','Layanan','Layanan','images/flowchart_sidangtera.png','Informasi prosedur tanda daftar gudang.'],
            ['Perpanjangan Minuman Beralkohol','layanan/minhol','Layanan','Layanan','images/flowchart_sidangtera.png','Informasi perpanjangan minuman beralkohol.'],
        ];
        foreach ($servicePages as $idx => [$title, $slug, $eyebrow, $group, $image, $excerpt]) {
            DB::table('site_pages')->updateOrInsert(['slug' => $slug], ['title' => $title, 'eyebrow' => $eyebrow, 'group' => $group, 'image' => $image, 'excerpt' => $excerpt, 'content' => $excerpt."\nKonten ini dapat diubah dari Admin Page tanpa mengedit file kode.", 'is_published' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]);
        }

        $defaultSettings = [
            ['address', 'Jl. Penanggungan No. 7, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur'],
            ['phone', '0354-771908'],
            ['email', 'disperdagin@kedirikota.go.id'],
        ];
        foreach ($defaultSettings as [$key, $value]) {
            DB::table('site_settings')->updateOrInsert(['key' => $key], ['value' => $value, 'created_at' => now(), 'updated_at' => now()]);
        }

        $banners = [
            ['images/project/banner 6.png', 0],
            ['images/project/Banner 1.png', 1],
            ['images/project/Banner 2.png', 2],
            ['images/project/Banner 3.png', 3],
        ];
        foreach ($banners as $idx => [$image, $order]) {
            DB::table('site_banners')->updateOrInsert(['image' => $image], ['title' => 'Banner '.($idx + 1), 'image' => $image, 'sort_order' => $order, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]);
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

        $defaultMap = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.482145629552!2d112.0164!3d-7.8169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785b7e2e7b6c8d%3A0x8f0e5c5f5b5e5a5f!2sKota%20Kediri!5e0!3m2!1sid!2sid!4v1';
        $defaultContact = '081234567890';

        $ikmFashion = [
            ['NR collection', 'Pakunden', 'Perumahan bence regency blok c18'],
            ['KAOS GAPLEK', 'Banjaran', 'Jl. Adi Sucipto No.54'],
            ['ELH COLLECTION', 'Kaliombo', 'Perum Puri Kaliombo Jl. Damai Blok C-9 RT.04 RW.09'],
            ['AMIRA CRAFT BY SANTI', 'Burengan', 'Jl. Letjen Sutoyo No.29'],
            ['GALUH KADIRI', 'Dermo', 'Perum Griya Intan Asri Blok A-14'],
            ['POISON WEARHOUSE', 'Setonopande', 'Jl. Sultan Agung no.71'],
            ['PERCALES', 'Ngronggo', 'Perumnas Ngronggo Jl. Dahlia 2 No.16'],
            ['BATIK WECONO ASRI', 'Dandangan', 'Jl. Dandangan I / 154'],
            ['TENUN IKAT SEMPURNA 2', 'Bandar Kidul', 'Jl. KH. Agus Salim VIII / 42-B'],
            ['KOPIAH M. THOIB', 'Bangsal', 'Jl. Mauni No. 87'],
            ['CHARGECITY', 'Ngronggo', 'Jl. Urip Sumoharjo No. 227'],
            ['TENUN IKAT SINAR BAROKAH', 'Ngronggo', 'Jl. Super Semar'],
            ['Kirani Craft', 'Ngronggo', 'Jl. Urip Sumoharjo No. 174'],
        ];
        foreach ($ikmFashion as $i => [$name, $kelurahan, $address]) {
            $idx = count($ikmFashion) * 0 + $i;
            DB::table('ikm')->updateOrInsert(
                ['name' => $name, 'category' => 'fashion'],
                ['kelurahan' => $kelurahan, 'address' => $address, 'contact' => $defaultContact, 'location' => $defaultMap, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $ikmKerajinan = [
            ['NR collection', 'Pakunden', 'Perumahan bence regency blok c18'],
            ['ELH COLLECTION', 'Kaliombo', 'Perum Puri Kaliombo Jl. Damai Blok C-9 RT.04 RW.09'],
            ['AMIRA CRAFT BY SANTI', 'Burengan', 'Jl. Letjen Sutoyo No.29'],
            ['PERCALES', 'Ngronggo', 'Perumnas Ngronggo Jl. Dahlia 2 No.16 Kediri'],
            ['TENUN IKAT SEMPURNA 2', 'Bandar Kidul', 'Jl. KH. Agus Salim VIII / 42-B Kediri'],
            ['KOPIAH M. THOIB', 'Bandar Kidul', 'Jl. Bandar Ngalim Gg.III No.7E Bandarkidul, Kota Kediri'],
            ['CHARGECITY', 'Kaliombo', 'Jl. Kaliombo Raya No.102 Kediri'],
            ['TENUN IKAT SINAR BAROKAH', 'Bandarkidul', 'Jl. KH. Agus Salim VIII / 9c Bandarkidul, Kota Kediri'],
            ['Kirani Craft', 'Bandarlor', 'Perum Candra Kirana F1, Kelurahan Bandarlor, Kota Kediri.'],
        ];
        foreach ($ikmKerajinan as $i => [$name, $kelurahan, $address]) {
            $idx = count($ikmFashion) + $i;
            DB::table('ikm')->updateOrInsert(
                ['name' => $name, 'category' => 'kerajinan'],
                ['kelurahan' => $kelurahan, 'address' => $address, 'contact' => $defaultContact, 'location' => $defaultMap, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $ikmMakanan = [
            ['Shakila food', 'Tamanan', 'Jln taman sari gang putih rt 3 rw 2'],
            ['ARAFAH KURMA & SEKAR KUNYIT', 'Ngronggo', 'Jln melati VI no 16 perumnas Ngronggo'],
            ['Kimie Lidi', 'Ngronggo', 'Perum ngronggo indah blok c no 4'],
            ['819 KITCHEN', 'Lirboyo', 'Griya Lirboyo Harmoni A-11'],
            ['BUMBU MASAK TE\'MAH', 'Sukorame', 'Jl. Veteran Gg. II No.8'],
            ['COKELAT TAHU WIJAYA KEMBAR', 'Tinalan', 'Tinalan Gg.IV Timur No.1'],
            ['CROVORY BUBUK REMPAH (Pakunden)', 'Pakunden', 'Perumahan bence regency blok c18'],
            ['CROVORY BUBUK REMPAH (Bandar Lor)', 'Bandar Lor', 'Jl. KH. Wahid Hasyim Va / 6'],
            ['BAKPIA ALMAIR', 'Kemasan', 'Jl. Panglima Polim No.72'],
            ['Stik Tahu Sis', 'Tinalan', 'Tinalan gg.4 timur no.15B rt.02 rw.02'],
            ['Pia 313', 'Setonopande', 'Jl. Pandean II/6'],
            ['KRIPIK PISANG CALLISTA', 'Bujel', 'KEL. BUJEL GG1 NO 14'],
            ['SAMBEL PECEL ERVINA', 'Ngronggo', 'Perumnas Ngronggo Jl. Kenongo VIII / 07'],
            ['TAHU MJS', 'Jamsaren', 'Jl. Mawar, Lingk. Kleco'],
            ['SEMPRONG SEKARJOYO', 'Pojok', 'Perum Wilis Indah I Jl. Wilis Mulya IV / 11'],
            ['MARIAMA FROZEN FOOD', 'Pesantren', 'Jl. Brigjend Pol. IBH Pranoto'],
            ['SAMBEL PECEL BU I', 'Blabak', 'Jl. Kapten Tendean No. 400'],
            ['PIE SUSU MUFFI', 'Ngronggo', 'Jl. Betet Bawang'],
            ['SAMBEL PECEL MBAH KENDHIL', 'Kampung Dalem', 'Jl. Kilisuci No. 72'],
            ['GETUK PISANG MADU MANIS 16', 'Semampir', 'Jl. Mayjend Sungkono'],
            ['KOPI PANDAWA', 'Betet', 'Jl. Raya Betet No.64'],
            ['EXTRA JUICE', 'Dandangan', 'Jl. Pemuda No.26'],
            ['SIRUP TRADISIONAL AL-HQ', 'Banaran', 'Jl. Masjid Timur No.405'],
            ['ARRAYANA HONEY', 'Sukorame', 'Perum KBN Jl. Anggraini Raya No.7'],
        ];
        foreach ($ikmMakanan as $i => [$name, $kelurahan, $address]) {
            $idx = count($ikmFashion) + count($ikmKerajinan) + $i;
            DB::table('ikm')->updateOrInsert(
                ['name' => $name, 'category' => 'makanan_minuman'],
                ['kelurahan' => $kelurahan, 'address' => $address, 'contact' => $defaultContact, 'location' => $defaultMap, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        $ikmLainnya = [
            ['ROKED SOAP', 'Bence', 'Perum Cahaya Permata Blok 12 No.11'],
            ['ARTERI HANDYCRAFT & SOUVENIR', 'Burengan', 'Jl. Letjend Sutoyo No. 48'],
        ];
        foreach ($ikmLainnya as $i => [$name, $kelurahan, $address]) {
            $idx = count($ikmFashion) + count($ikmKerajinan) + count($ikmMakanan) + $i;
            DB::table('ikm')->updateOrInsert(
                ['name' => $name, 'category' => 'lainnya'],
                ['kelurahan' => $kelurahan, 'address' => $address, 'contact' => $defaultContact, 'location' => $defaultMap, 'is_active' => true, 'sort_order' => $idx + 1, 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
