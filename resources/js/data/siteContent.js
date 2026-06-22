export const asset = (path) => `/assets/${path}`;

export const routeAliases = {
  '/tentang.php': '/tentang', '/struktur.php': '/struktur', '/programKegiatan': '/program-kegiatan', '/programKegiatan.php': '/program-kegiatan',
  '/halal': '/layanan/halal', '/halal.php': '/layanan/halal', '/merk': '/layanan/merk', '/merk.php': '/layanan/merk', '/sinas': '/layanan/sinas', '/sinas.php': '/layanan/sinas', '/tera': '/layanan/tera', '/tera.php': '/layanan/tera', '/td-gudang': '/layanan/td-gudang', '/td-gudang.php': '/layanan/td-gudang', '/td-gudang': '/layanan/td-gudang', '/td_gudang': '/layanan/td-gudang', '/td_gudang.php': '/layanan/td-gudang', '/minhol': '/layanan/minhol', '/minhol.php': '/layanan/minhol',
  '/zona-integritas.php': '/zona-integritas', '/mnj-perubahan': '/zona-integritas/mnj-perubahan', '/mnj-perubahan.php': '/zona-integritas/mnj-perubahan', '/tata-laksana': '/zona-integritas/tata-laksana', '/tata-laksana.php': '/zona-integritas/tata-laksana', '/mnj-sdm': '/zona-integritas/mnj-sdm', '/mnj-sdm.php': '/zona-integritas/mnj-sdm', '/akuntabilitas': '/zona-integritas/akuntabilitas', '/akuntabilitas.php': '/zona-integritas/akuntabilitas', '/pengawasan': '/zona-integritas/pengawasan', '/pengawasan.php': '/zona-integritas/pengawasan', '/pelayanan-publik': '/zona-integritas/pelayanan-publik', '/pelayanan-publik.php': '/zona-integritas/pelayanan-publik',
  '/unduhan-renstra': '/unduhan/renstra', '/unduhan-renstra.php': '/unduhan/renstra', '/unduhan-renja': '/unduhan/renja', '/unduhan-renja.php': '/unduhan/renja', '/unduhan-laporan': '/unduhan/laporan', '/unduhan-laporan.php': '/unduhan/laporan', '/pasar.php':'/pasar', '/pasar-modern.php':'/pasar-modern', '/minimarket.php':'/minimarket', '/mall.php':'/mall', '/ikm.php':'/ikm', '/galeri.php':'/galeri', '/peraturan.php':'/peraturan', '/contact.php':'/kontak', '/contact':'/kontak', '/formBokingTera':'/form-booking-tera', '/formBokingTera.php':'/form-booking-tera', '/maintance':'/maintenance', '/maintance.php':'/maintenance'
};

export const menu = [
  { title: 'Tentang', items: [
    { label: 'Profil', href: '/tentang' },
    { label: 'Struktur Organisasi', href: '/struktur' },
    { label: 'Program', href: '/program-kegiatan' },
  ]},
  { title: 'Informasi', items: [
    { label: 'Informasi Harga', href: '/informasi-pasar' },
    { label: 'Pasar Rakyat', href: '/pasar' },
    { label: 'Pasar Modern', href: '/pasar-modern' },
    { label: 'Minimarket', href: '/minimarket' },
    { label: 'Pusat Perbelanjaan', href: '/mall' },
    { label: 'Industri Kecil Menengah', href: '/ikm' },
    { label: 'Peraturan', href: '/peraturan' },
  ]},
  { title: 'Layanan', items: [
    { label: 'Bantuan Modal', href: 'https://banmod.indagkediri.online/', external: true },
    { label: 'Sertifikasi Halal', href: '/layanan/halal' },
    { label: 'Legalitas Merk', href: '/layanan/merk' },
    { label: 'SIINas', href: '/layanan/sinas' },
    { label: 'Tera/Tera Ulang', href: '/layanan/tera' },
    { label: 'Tanda Daftar Gudang', href: '/layanan/td-gudang' },
    { label: 'Perpanjangan Minuman Beralkohol', href: '/layanan/minhol' },
  ]},
  { title: 'Unduhan', items: [
    { label: 'Rencana Strategis', href: '/unduhan/renstra' },
    { label: 'Rencana Kerja', href: '/unduhan/renja' },
    { label: 'Laporan', href: '/unduhan/laporan' },
  ]},
];

export const services = [
  { title: 'Bantuan Modal', desc: 'Informasi bantuan modal dan penguatan usaha masyarakat.', href: 'https://banmod.indagkediri.online/' },
  { title: 'Sertifikasi Halal', desc: 'Alur sertifikasi halal reguler maupun fasilitasi gratis.', href: '/layanan/halal', image: 'images/flowchart_halalReguler.png' },
  { title: 'Legalitas Merk', desc: 'Pendampingan perlindungan merek pelaku usaha.', href: '/layanan/merk', image: 'images/flowchart_merk.png' },
  { title: 'SIINas', desc: 'Layanan informasi Sistem Informasi Industri Nasional.', href: '/layanan/sinas', image: 'images/flowchart_siinas.png' },
  { title: 'Tera/Tera Ulang', desc: 'Informasi layanan tera dan sidang tera ulang.', href: '/layanan/tera', image: 'images/flowchart_tera.png' },
  { title: 'Tanda Daftar Gudang', desc: 'Informasi pengurusan Tanda Daftar Gudang.', href: '/layanan/td-gudang', image: 'images/flowchart_tdg.png' },
];

export const staticPages = {
  '/tentang': { title: 'Profil Dinas', eyebrow: 'Tentang DISPERDAGIN', image: 'images/office.png', body: ['Dinas Perdagangan dan Perindustrian Kota Kediri menyelenggarakan urusan pemerintahan bidang perdagangan dan perindustrian di Kota Kediri.', 'Konten profil sekarang juga disiapkan sebagai data dinamis pada tabel site_pages sehingga dapat diubah dari Admin Page.'], cards: [['Alamat', 'Jl. Penanggungan No. 7, Bandar Lor, Kecamatan Mojoroto, Kota Kediri'], ['Email', 'disperdagin@kedirikota.go.id'], ['Telepon', '0354-771908']] },
  '/struktur': { title: 'Struktur Organisasi', eyebrow: 'Tentang', image: 'images/struktur-organisasi (1).png', body: ['Struktur organisasi dapat diganti melalui asset/CMS admin.'] },
  '/program-kegiatan': { title: 'Program Kerja', eyebrow: 'Tentang', image: 'images/Notebook.png', body: ['Program dan kegiatan DISPERDAGIN disiapkan sebagai konten dinamis.'] },
  '/zona-integritas': { title: 'Zona Integritas', eyebrow: 'Reformasi Birokrasi', image: 'images/zona-integritas.webp', body: ['Zona Integritas merupakan komitmen peningkatan kualitas pelayanan publik, akuntabilitas, pengawasan, tata laksana, manajemen perubahan, dan manajemen SDM.'] },
  '/zona-integritas/mnj-perubahan': { title: 'Manajemen Perubahan', eyebrow: 'Zona Integritas', image: 'images/mnj-perubahan.webp', body: ['Fokus pada perubahan pola pikir, budaya kerja, dan komitmen seluruh unsur organisasi.'] },
  '/zona-integritas/tata-laksana': { title: 'Penataan Tata Laksana', eyebrow: 'Zona Integritas', image: 'images/tata-laksana.webp', body: ['Mendorong SOP, sistem kerja, dan proses layanan yang lebih efektif, efisien, serta terdokumentasi.'] },
  '/zona-integritas/mnj-sdm': { title: 'Penataan Manajemen Sumber Daya Manusia', eyebrow: 'Zona Integritas', image: 'images/mnj-sdm.webp', body: ['Penguatan SDM melalui penataan kebutuhan, kompetensi, kinerja, dan kedisiplinan pegawai.'] },
  '/zona-integritas/akuntabilitas': { title: 'Penguatan Akuntabilitas', eyebrow: 'Zona Integritas', image: 'images/akuntabilitas.webp', body: ['Penguatan akuntabilitas kinerja melalui perencanaan, pengukuran, pelaporan, dan evaluasi.'] },
  '/zona-integritas/pengawasan': { title: 'Penguatan Pengawasan', eyebrow: 'Zona Integritas', image: 'images/pengawasan.webp', body: ['Penguatan pengawasan untuk mengurangi risiko penyimpangan dan meningkatkan integritas layanan.'] },
  '/zona-integritas/pelayanan-publik': { title: 'Peningkatan Kualitas Pelayanan Publik', eyebrow: 'Zona Integritas', image: 'images/pelayanan-publik.webp', body: ['Penyederhanaan proses, transparansi layanan, dan peningkatan kepuasan masyarakat.'] },
  '/pasar': { title: 'Informasi Pasar Rakyat', eyebrow: 'Informasi', image: 'images/pasar.jpeg', body: ['Daftar dan profil pasar rakyat Kota Kediri. Data pasar dibuat dinamis melalui Admin Page.'], cards: [['Pasar Banjaran','Pasar rakyat'], ['Pasar Bandar','Pasar rakyat'], ['Pasar Pahing','Pasar rakyat'], ['Pasar Setonobetek','Pasar rakyat'], ['Pasar Grosir Ngronggo','Pasar rakyat'], ['Pasar Mojoroto','Pasar rakyat'], ['Pasar Campurejo','Pasar rakyat']] },
  '/pasar-modern': { title: 'Informasi Pasar Modern', eyebrow: 'Informasi', image: 'images/supermarket.jpeg', body: ['Informasi pasar modern dan supermarket.'], cards: [['Borobudur Swalayan','Retail modern'], ['Golden Swalayan','Retail modern'], ['Hypermart','Retail modern'], ['Super Indo','Retail modern'], ['Transmart','Retail modern']] },
  '/minimarket': { title: 'Informasi Minimarket', eyebrow: 'Informasi', image: 'images/supermarket.jpeg', body: ['Informasi minimarket seperti Indomaret, Alfamart, Alfamidi, Mekar Mart, dan Tsamaniya. Aset foto lama sudah dibawa ke public/assets/images/minimarket.'], cards: [['Indomaret', 'Jaringan minimarket'], ['Alfamart', 'Jaringan minimarket'], ['Alfamidi', 'Jaringan minimarket'], ['Mekar Mart', 'Retail lokal'], ['Tsamaniya', 'Retail lokal']] },
  '/mall': { title: 'Informasi Pusat Perbelanjaan', eyebrow: 'Informasi', image: 'images/mall.jpeg', body: ['Informasi pusat perbelanjaan di Kota Kediri.'], cards: [['Kediri Town Square','Pusat perbelanjaan'], ['Kediri Mall','Pusat perbelanjaan'], ['Ramayana Mall Kediri','Pusat perbelanjaan'], ['Dhoho Plaza Kediri','Pusat perbelanjaan'], ['Golden Theater','Pusat perbelanjaan/hiburan']] },
  '/ikm': { title: 'Informasi Industri Kecil Menengah', eyebrow: 'Informasi', image: 'images/industri.jpeg', body: ['Halaman IKM disiapkan untuk kategori fashion, makanan/minuman, kerajinan, dan lainnya.'], cards: [['Fashion','Produk sandang'], ['Makanan & Minuman','Produk kuliner'], ['Kerajinan','Produk kreatif'], ['Lainnya','Produk IKM lainnya']] },
  '/galeri': { title: 'Galeri', eyebrow: 'Publikasi', image: 'images/galeri/Halal-bihalal.jpg', body: ['Galeri foto kegiatan lama tetap disertakan pada assets dan bisa dikembangkan menjadi CMS galeri.'] },
  '/peraturan': { title: 'Peraturan', eyebrow: 'Informasi', image: 'images/SealCheck.png', body: ['Daftar peraturan dapat dikembangkan menjadi modul dokumen dinamis.'] },
  '/kontak': { title: 'Kontak DISPERDAGIN', eyebrow: 'Kontak', image: 'images/office.png', body: ['Silakan menghubungi DISPERDAGIN Kota Kediri untuk informasi pelayanan perdagangan dan perindustrian.'], cards: [['Telepon','0354-771908'], ['Email','disperdagin@kedirikota.go.id'], ['Alamat','Jl. Penanggungan No. 7, Kota Kediri']] },
  '/form-booking-tera': { title: 'Form Booking Tera', eyebrow: 'Layanan', image: 'images/flowchart_sidangtera.png', body: ['Halaman booking tera dari web lama sudah dimapping. Tahap berikutnya bisa dibuat form online dan tracking jadwal.'] },
  '/maintenance': { title: 'Maintenance', eyebrow: 'Informasi', image: 'images/tandatanya.webp', body: ['Halaman penanda pemeliharaan/maintenance dari web lama tetap dimapping.'] },
};

export const servicePages = {
  '/layanan/halal': { title: 'Sertifikasi Halal', flow: 'images/flowchart_halalReguler.png', desc: 'Informasi tata cara dan pendampingan sertifikasi halal untuk pelaku usaha.' },
  '/layanan/merk': { title: 'Legalitas Merk', flow: 'images/flowchart_merk.png', desc: 'Informasi tata cara pengajuan legalitas merek.' },
  '/layanan/sinas': { title: 'SIINas', flow: 'images/flowchart_siinas.png', desc: 'Informasi layanan Sistem Informasi Industri Nasional.' },
  '/layanan/tera': { title: 'Tera/Tera Ulang', flow: 'images/flowchart_tera.png', desc: 'Informasi tata cara tera dan tera ulang.' },
  '/layanan/td-gudang': { title: 'Tanda Daftar Gudang', flow: 'images/flowchart_tdg.png', desc: 'Informasi pengurusan Tanda Daftar Gudang.' },
  '/layanan/minhol': { title: 'Perpanjangan Minuman Beralkohol', flow: 'images/flow_minhol.png', desc: 'Informasi tata cara perpanjangan izin minuman beralkohol.' },
};

export const downloads = {
  '/unduhan/renstra': [['RENSTRA DISPERDAGIN Tahun 2025-2026', 'aset_download/RENSTRA DISPERDAGIN TAHUN 2025-2026.pdf'], ['Dokumen RENSTRA DISPERDAGIN 2024', 'aset_download/Dokumen RENSTRA DISPERDAGIN 2024.pdf']],
  '/unduhan/renja': [['Dokumen Renja Disperdagin 2023', 'aset_download/Dokumen Renja Disperdagin 2023.pdf'], ['Dokumen Renja Disperdagin 2024', 'aset_download/Dokumen Renja Disperdagin 2024.pdf'], ['Dokumen Renja Disperdagin 2025', 'aset_download/20240911 Dokumen Renja Disperdagin 2025.pdf']],
  '/unduhan/laporan': [['Dokumen LKjIP Disperdagin 2022', 'aset_download/Dokumen LKjIP Disperdagin 2022.pdf'], ['Dokumen LKjIP Disperdagin 2023', 'aset_download/Dokumen LKjIP Disperdagin 2023.pdf'], ['LKJPD Disperdagin 2024', 'aset_download/LKJPD Disperdagin 2024_Bab I & IV_Final TTE.pdf']],
};

export const routesIndex = [
  ['Beranda', '/'], ['Profil', '/tentang'], ['Struktur Organisasi', '/struktur'], ['Program Kerja', '/program-kegiatan'], ['Informasi Harga', '/informasi-pasar'], ['Survey Kepuasan', '/survey'], ['Admin Page', '/admin'], ['Dashboard PKL', '/pkl/dashboard'], ['Input PKL', '/pkl/input'], ['Zona Integritas', '/zona-integritas'], ['Galeri', '/galeri'], ['Pasar Rakyat', '/pasar'], ['Pasar Modern', '/pasar-modern'], ['Minimarket', '/minimarket'], ['Pusat Perbelanjaan', '/mall'], ['IKM', '/ikm'], ['Peraturan', '/peraturan'], ['Kontak', '/kontak'], ['Unduhan Renstra', '/unduhan/renstra'], ['Unduhan Renja', '/unduhan/renja'], ['Unduhan Laporan', '/unduhan/laporan'],
];
