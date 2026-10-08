<?php

namespace Database\Seeders;

use App\Models\ExhibitionProduct;
use Illuminate\Database\Seeder;

class ExhibitionProductSeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            ['name' => 'Kediri Rasa Nusantara', 'logo' => 'images/bintang.png', 'phone' => '081234560101', 'website' => 'https://example.com/kediri-rasa', 'address' => 'Jl. Dhoho No. 18, Kota Kediri', 'products' => ['Sambal Pecel Manten', 'Keripik Tahu Gurih', 'Getuk Pisang Premium', 'Stik Tahu Rempah', 'Kopi Brantas Robusta'], 'photos' => ['images/cabe.jpg', 'images/d1.png', 'images/hero.png']],
            ['name' => 'Tenun Sekar Kediri', 'logo' => 'images/dp2.png', 'phone' => null, 'website' => 'https://example.com/tenun-sekar', 'address' => 'Jl. Penanggungan No. 42, Kota Kediri', 'products' => ['Selendang Tenun Sekar', 'Tas Etnik Panji', 'Dompet Tenun Dhoho', 'Outer Tenun Laras', 'Kain Tenun Motif Brantas'], 'photos' => ['images/industri.jpeg', 'images/bagus alit.png', 'images/Notebook.png']],
            ['name' => 'Kriya Brantas Lestari', 'logo' => 'images/lpicon.png', 'phone' => '082233440202', 'website' => null, 'address' => 'Jl. Veteran No. 76, Kota Kediri', 'products' => ['Vas Anyam Brantas', 'Kotak Hampers Bambu', 'Lampu Meja Rotan', 'Keranjang Serbaguna', 'Hiasan Dinding Panji'], 'photos' => ['images/mnj-perubahan.webp', 'images/mnj-sdm.webp', 'images/akuntabilitas.webp']],
            ['name' => 'Herba Wilis Sejahtera', 'logo' => 'images/ChatText.png', 'phone' => null, 'website' => null, 'address' => 'Jl. Kilisuci No. 9, Kota Kediri', 'products' => ['Wedang Rempah Wilis', 'Madu Bunga Kelengkeng', 'Teh Rosella Organik', 'Serbuk Jahe Merah', 'Minuman Kunyit Asam'], 'photos' => ['images/gula.jpg', 'images/minyak.jpg', 'images/beras.png']],
        ];
        $documents = [
            'aset_download/File Layanan Disperdagin.pdf',
            'aset_download/File Layanan Disperdagin Merk.pdf',
            'aset_download/Dokumen RENSTRA DISPERDAGIN 2024.pdf',
            'aset_download/File Layanan Disperdagin Halal.pdf',
        ];

        $order = 1;
        foreach ($companies as $companyIndex => $company) {
            foreach ($company['products'] as $index => $name) {
                $images = [
                    $company['photos'][$index % 3],
                    $company['photos'][($index + 1) % 3],
                    $company['photos'][($index + 2) % 3],
                ];

                ExhibitionProduct::updateOrCreate(
                    ['name' => $name, 'company' => $company['name']],
                    [
                        'product_image' => $images[0],
                        'images' => $images,
                        'logo' => $company['logo'],
                        'phone' => $company['phone'],
                        'website' => $company['website'],
                        'address' => $company['address'],
                        'detail_pdf' => $documents[$companyIndex],
                        'is_active' => true,
                        'sort_order' => $order++,
                    ],
                );
            }
        }
    }
}
