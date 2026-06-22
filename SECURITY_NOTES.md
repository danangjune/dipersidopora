# Catatan keamanan dari ZIP lama

Saat inspeksi ZIP native PHP, ditemukan beberapa risiko yang tidak ikut dimigrasikan:

1. **Credential database hardcoded** tersebar di file PHP lama seperti `koneksi.php`, `survey_pasar/includes/db.php`, dan `pkl/include/koneksi.php`.
2. **Folder upload berisi file executable** seperti `.php`, `.phtml`, dan nama yang menyerupai webshell/backdoor pada `pkl/uploads`.
3. **File log dan file arsip lama** tidak dipindahkan ke project Laravel.
4. **Upload native** sebelumnya memindahkan file langsung ke folder publik tanpa pembatasan ekstensi yang cukup aman.

Di project baru:

- File executable dari upload lama tidak disalin.
- `.env.example` memakai placeholder credential.
- Upload PKL divalidasi sebagai image dan disimpan melalui disk Laravel `public`.
- `public/.htaccess` menolak eksekusi `php/phtml/phar` bila file sejenis muncul di public directory.

Rekomendasi sebelum production:

- Rotasi password database karena credential lama sudah ada di source ZIP.
- Audit hosting lama dan bersihkan semua file upload mencurigakan.
- Pastikan folder `storage` tidak bisa mengeksekusi PHP.
- Tambahkan autentikasi dan middleware role untuk endpoint admin/surveyor.


## Tambahan revisi

- Admin Page pada scaffold ini belum dipasang middleware login agar mudah diuji. Sebelum production, bungkus route `/api/admin/*` dan `/admin` dengan auth/Sanctum/session middleware.
- File PHP/PHTML tersembunyi dari folder upload lama tetap tidak dimigrasikan sebagai file executable.
- Archive `banner 4.zip` dari asset lama tidak disalin ke runtime karena tidak dibutuhkan untuk tampilan web dan lebih aman tidak membuka archive yang tidak diperlukan.
