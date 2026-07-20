export const asset = (path = "") => {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/")
  ) {
    return path;
  }

  return `/assets/${path}`;
};

export const routeAliases = {
  "/tentang.php": "/tentang",
  "/struktur.php": "/struktur",
  "/programKegiatan": "/program-kegiatan",
  "/programKegiatan.php": "/program-kegiatan",

  "/halal": "/layanan/halal",
  "/halal.php": "/layanan/halal",
  "/merk": "/layanan/merk",
  "/merk.php": "/layanan/merk",
  "/sinas": "/layanan/sinas",
  "/sinas.php": "/layanan/sinas",
  "/tera": "/layanan/tera",
  "/tera.php": "/layanan/tera",
  "/td-gudang": "/layanan/td-gudang",
  "/td-gudang.php": "/layanan/td-gudang",
  "/td_gudang": "/layanan/td-gudang",
  "/td_gudang.php": "/layanan/td-gudang",
  "/minhol": "/layanan/minhol",
  "/minhol.php": "/layanan/minhol",

  "/zona-integritas.php": "/zona-integritas",
  "/mnj-perubahan": "/zona-integritas/mnj-perubahan",
  "/mnj-perubahan.php": "/zona-integritas/mnj-perubahan",
  "/tata-laksana": "/zona-integritas/tata-laksana",
  "/tata-laksana.php": "/zona-integritas/tata-laksana",
  "/mnj-sdm": "/zona-integritas/mnj-sdm",
  "/mnj-sdm.php": "/zona-integritas/mnj-sdm",
  "/akuntabilitas.php": "/zona-integritas/akuntabilitas",
  "/pengawasan.php": "/zona-integritas/pengawasan",
  "/pelayanan-publik.php": "/zona-integritas/pelayanan-publik",

  "/unduhan-renstra": "/unduhan/renstra",
  "/unduhan-renstra.php": "/unduhan/renstra",
  "/unduhan-renja": "/unduhan/renja",
  "/unduhan-renja.php": "/unduhan/renja",
  "/unduhan-laporan": "/unduhan/laporan",
  "/unduhan-laporan.php": "/unduhan/laporan",

  "/pasar.php": "/pasar",
  "/pasar-modern.php": "/pasar-modern",
  "/minimarket.php": "/minimarket",
  "/mall.php": "/mall",
  "/ikm.php": "/ikm",
  "/galeri.php": "/galeri",
  "/contact.php": "/kontak",
  "/contact": "/kontak",
  "/formBokingTera": "/form-booking-tera",
  "/formBokingTera.php": "/form-booking-tera",
  "/maintance": "/maintenance",
  "/maintance.php": "/maintenance",
};

export const menu = [
  {
    title: "Tentang",
    items: [
      { label: "Profil", href: "/tentang" },
      { label: "Struktur Organisasi", href: "/struktur" },
      { label: "Program", href: "/program-kegiatan" },
    ],
  },
  {
    title: "Informasi",
    items: [
      { label: "Informasi Harga", href: "/informasi-pasar" },
      { label: "Pasar Rakyat", href: "/pasar" },
      { label: "Pasar Modern", href: "/pasar-modern" },
      { label: "Pusat Perbelanjaan", href: "/mall" },
      { label: "Industri Kecil Menengah", href: "/ikm" },
    ],
  },
  {
    title: "Layanan",
    items: [
      {
        label: "Bantuan Modal & Pelatihan",
        href: "https://sultan.kedirikota.go.id/",
        external: true,
      },
      { label: "Sertifikasi Halal", href: "/layanan/halal" },
      { label: "Legalitas Merk", href: "/layanan/merk" },
      { label: "SIINas", href: "/layanan/sinas" },
      { label: "Tera/Tera Ulang", href: "/layanan/tera" },
      { label: "Tanda Daftar Gudang", href: "/layanan/td-gudang" },
      { label: "Perpanjangan Minuman Beralkohol", href: "/layanan/minhol" },
    ],
  },
  {
    title: "Unduhan",
    items: [
      { label: "Rencana Strategis", href: "/unduhan/renstra" },
      { label: "Rencana Kerja", href: "/unduhan/renja" },
      { label: "Laporan", href: "/unduhan/laporan" },
    ],
  },
];

export const routesIndex = [
  ["Beranda", "/"],
  ...menu.flatMap((group) =>
    group.items
      .filter((item) => !item.external)
      .map((item) => [item.label, item.href]),
  ),
  ["Survey Kepuasan", "/survey"],
  ["Admin Page", "/admin"],
  ["Dashboard PKL", "/pkl/dashboard"],
  ["Input PKL", "/pkl/input"],
  ["Zona Integritas", "/zona-integritas"],
  ["Galeri", "/galeri"],
  ["Kontak", "/kontak"],
];

export function normalizePath(path = "/") {
  let p = path.replace(/\/$/, "") || "/";
  p = p.replace(/\.php$/, "").replaceAll("_", "-");

  return routeAliases[p] || p;
}

export async function apiGet(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gagal mengambil data.");
  }

  return data.data ?? data;
}
