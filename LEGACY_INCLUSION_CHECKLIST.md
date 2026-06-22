# Checklist Inklusi Web Lama ke Laravel React

Status: revisi ini menjaga halaman/aset utama dari web native dan menyiapkan pengelolaan dinamis melalui Admin Page.

## Mapping halaman lama

| File lama | Route Laravel/React baru | Status |
|---|---|---|
| index.php | / | include |
| tentang.php | /tentang | include + CMS dinamis |
| struktur.php | /struktur | include + CMS dinamis |
| programKegiatan.php | /program-kegiatan | include + CMS dinamis |
| informasi-pasar.php | /informasi-pasar | include + fitur baru harga komoditas |
| hargaKom.php | /harga-komoditas dan /informasi-pasar | include |
| pasar.php | /pasar | include + pasar dinamis admin |
| pasar-modern.php | /pasar-modern | include |
| minimarket.php | /minimarket | include |
| mall.php | /mall | include |
| ikm.php | /ikm | include |
| halal.php | /layanan/halal | include |
| merk.php | /layanan/merk | include |
| sinas.php | /layanan/sinas | include |
| tera.php | /layanan/tera | include |
| td_gudang.php | /layanan/td-gudang | include |
| minhol.php | /layanan/minhol | include |
| formBokingTera.php | /form-booking-tera | include |
| peraturan.php | /peraturan | include + siap dokumen dinamis |
| galeri.php | /galeri | include aset galeri |
| contact.php | /kontak | include |
| unduhan-renstra.php | /unduhan/renstra | include dokumen |
| unduhan-renja.php | /unduhan/renja | include dokumen |
| unduhan-laporan.php | /unduhan/laporan | include dokumen |
| zona-integritas.php | /zona-integritas | include |
| mnj-perubahan.php | /zona-integritas/mnj-perubahan | include |
| tata-laksana.php | /zona-integritas/tata-laksana | include |
| mnj-sdm.php | /zona-integritas/mnj-sdm | include |
| akuntabilitas.php | /zona-integritas/akuntabilitas | include |
| pengawasan.php | /zona-integritas/pengawasan | include |
| pelayanan-publik.php | /zona-integritas/pelayanan-publik | include |
| kuesioner.php | /survey | include + setting link/barcode SKM |
| survey_pasar/index.php | /survey-pasar atau /survey | include konsep survey |
| pkl/*.php | /pkl/dashboard, /pkl/input, API pedagang | include fitur inti PKL |

## Modul dinamis yang ditambahkan

- Admin Page: `/admin`
- Pasar dinamis: tambah/ubah/nonaktifkan pasar.
- Komoditas dinamis: tambah/ubah/nonaktifkan komoditas.
- Harga komoditas dinamis: input harga per pasar, tanggal, komoditas.
- HET/HAP: bisa diatur per komoditas dan opsional per pasar.
- Indikator internal: kolom aman/waspada/intervensi disiapkan; rumus sementara berbasis HET/HAP dan bisa diganti setelah rumus final.
- Excel: `/api/admin/prices/export` menghasilkan file `.xls` yang bisa dibuka Excel.
- Web profil/CMS: halaman profil dan konten publik dapat dikelola dari Admin Page.
- Dokumen unduhan: daftar file dapat dikelola dari Admin Page.
- Survey/SKM: link survey dan barcode/QR dapat diganti dari Admin Page.

## Catatan keamanan

File PHP tersembunyi/mencurigakan dari folder upload lama tidak ikut dijalankan. Aset gambar/PDF/CSS/JS aman tetap dibawa ke `public/assets`.
