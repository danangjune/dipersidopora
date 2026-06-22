const availabelKeywords = [
    'Galeri',
    'Profil',
    'Struktur Organisasi',
    'Program dan Kegiatan',
    'Pasar',
    'Pasar',
    'Informasi Harga',
    'Minimarket',
    'Mall',
    'Industri Kecil Menengah',
    'Bantuan Modal',
    'Legalitas Merk',
    'Sertifikasi Halal',
    'Sinas',
    'Tera/Tera Ulang',
    'Produk Unggulan',
    'Zona Integritas',
    'Rencana Kerja',
    'Rencana Strategis',
    'Laporan',
    'Berita',
    'Galeri'
];

const resultBox = document.getElementById("result-box");
const inputBox = document.getElementById("input-box");

inputBox.addEventListener("input", function () {
    const input = inputBox.value.toLowerCase();
    const results = availabelKeywords.filter(keyword => keyword.toLowerCase().includes(input));

    displayResults(results);

});


inputBox.addEventListener("focusout", function () {
    setTimeout(() => {
        resultBox.innerHTML = "";
    }, 200); // waktu tunda 200ms
});

//inputBox.addEventListener("focusout", function() {
//    resultBox.innerHTML = "";
//});

function displayResults(results) {
    let content = "";

    results.forEach(result => {
        let link = getLinkForKeyword(result);
        content += "<li><a href='" + link + "' style = 'color: black; cursor: pointer;'>" + result + "</a></li>";
    });

    resultBox.innerHTML = "<ul>" + content + "</ul>";
}

function getLinkForKeyword(keyword) {
    switch(keyword) {
        case 'Galeri':
            return 'galeri.php';
        case 'Profil':
            return 'tentang.php';
        case 'Struktur Organisasi':
            return 'struktur.php';
        case 'Program dan Kegiatan':
            return 'programKegiatan.php';
        case 'Pasar':
            return 'pasar.php';
        case 'Informasi Harga':
            return 'informasi-pasar.php';
        case 'Minimarket':
            return 'minimarket.php';
        case 'Mall':
            return 'mall.php';
        case 'Industri Kecil Menengah':
            return 'ikm.php';
        case 'Bantuan Modal':
            return 'ikm.php';
        case 'Legalitas Merk':
            return 'merk.php';
        case 'Sertifikasi Halal':
            return 'halal.php';
        case 'Sinas':
            return 'sinas.php';
        case 'Tera/Tera Ulang':
            return 'tera.php';
        case 'Produk Unggulan':
            return 'https://pusakaumkm.id/home/';
        case 'Zona Integritas':
            return 'zona-integritas.php';
        case 'Rencana Kerja':
            return 'unduhan-renja.php';
        case 'Rencana Strategis':
            return 'unduhan-renstra.php';
        case 'Laporan':
            return 'unduhan-laporan.php';
        case 'Berita':
            return 'berita.php';
        case 'Galeri':
            return 'galeri.php';
        default:
            return 'index.php';
    }
}

