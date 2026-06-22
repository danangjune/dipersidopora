# DISPERDAGIN Laravel + React

Ini adalah hasil migrasi awal dari aplikasi native PHP `public_html` menjadi struktur Laravel API + React frontend.

## Isi utama

- **Laravel backend** untuk API harga komoditas, survey kepuasan, statistik pengunjung, dan CRUD PKL.
- **React frontend** untuk web profile, informasi pasar, survey, dan dashboard/input PKL.
- **Assets lama** dipindah ke `public/assets` agar gambar, PDF unduhan, dan logo tetap bisa dipakai.
- **Credential database hardcoded sudah dihapus** dan diganti konfigurasi `.env`.
- **File upload PHP/PHTML mencurigakan tidak ikut dimigrasikan**.

## Cara menjalankan lokal

```bash
cp .env.example .env
composer install
npm install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run dev
php artisan serve
```

Buka: `http://127.0.0.1:8000`

Akun demo seeder:

```text
username: admin
password: Admin#12345
```

> Catatan: autentikasi UI belum dipasang penuh agar scaffold ringan. Endpoint API sudah siap diberi middleware Sanctum/Breeze/Fortify pada tahap berikutnya.

## Mapping fitur lama ke baru

| Native PHP lama | Laravel/React baru |
|---|---|
| `index.php` | `/` React Home |
| `komponen/navbar.php`, `komponen/footer.php` | `resources/js/components/Layout.jsx` |
| `api_harga_komoditas.php` | `GET /api/market-prices` |
| `data-load.php` | `GET /api/market-prices/table` |
| `survey_pasar/surveyor/action.php` | `POST /api/market-prices` |
| `survey_pasar/admin/includes/pasar_*.php` | `GET /api/market-prices/pending/{pasar}` dan `PATCH /api/market-prices/{pasar}/{id}/validate` |
| `kuesioner.php` | `POST /api/survey` |
| `pkl/dashboard.php` | `/pkl/dashboard` + `GET /api/pedagang` |
| `pkl/input_pedagang.php` | `/pkl/input` + `POST /api/pedagang` |
| `pkl/export_excel.php` | `GET /api/pedagang/export` CSV |

## Struktur penting

```text
app/Http/Controllers/Api      # Controller API Laravel
app/Models                    # Model Eloquent
routes/api.php                # Semua endpoint JSON
routes/web.php                # Fallback React SPA
database/migrations           # Struktur tabel pengganti native SQL
resources/js                  # Frontend React
resources/css/app.css         # Tema tampilan modern
public/assets                 # Asset lama yang aman
```

## Hal yang sengaja diperbaiki

1. Query raw dan string interpolation native PHP diganti Query Builder/Eloquent.
2. Upload file PKL hanya menerima image dan masuk ke `storage/app/public`, bukan folder publik yang bisa mengeksekusi PHP.
3. Password dan credential DB tidak lagi ditulis di source code.
4. API mengembalikan JSON konsisten.
5. Route dibuat lebih rapi: `/layanan/halal`, `/informasi-pasar`, `/survey`, `/pkl/dashboard`.
6. Tampilan dibuat responsive tanpa bergantung pada file native yang bercampur PHP.

## Catatan migrasi lanjutan

- Modul login/role admin-surveyor sebaiknya dilanjutkan dengan Laravel Breeze/Sanctum/Fortify.
- Data produksi lama perlu di-export dari MySQL dan di-import ke tabel migrasi ini.
- Jika ingin CMS penuh untuk konten halaman, buat tabel `pages`, `downloads`, `galleries`, dan `services` lalu ubah `siteContent.js` menjadi API-driven.


## Revisi Notulen Rapat Harga Komoditas

Route penting:

- Publik harga komoditas: `/informasi-pasar`
- Internal harga + indikator: `/internal/harga`
- Admin Page: `/admin`
- Export Excel harga: `/api/admin/prices/export`
- Survey/SKM: `/survey`

Fitur dinamis yang sudah disiapkan:

1. Pasar dan komoditas dikelola dari Admin Page.
2. Halaman utama harga menampilkan gambar komoditas kecil formasi 5 x 2.
3. Tabel masyarakat umum tidak menampilkan indikator.
4. Mode internal menampilkan HET/HAP, indikator aman/waspada/intervensi, dan rata-rata mingguan/bulanan/tahunan.
5. Filter utama adalah pasar, lalu tanggal dan komoditas. Default periode satu minggu.
6. Link survey dan barcode SKM dapat diganti dari Admin Page.
7. Web profil/CMS dan dokumen unduhan dapat dikelola dari Admin Page.

Lihat `LEGACY_INCLUSION_CHECKLIST.md` untuk mapping halaman web native lama ke Laravel/React.
