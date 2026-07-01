import { useEffect, useState } from "react";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function PriceWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/summary")
      .then((r) => r.json())
      .then((d) => setItems(d?.data?.rows || d?.data?.list_komoditas || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="sectionTitle">
        <span>Harga Komoditas</span>
        <h2>Rata-rata Harga Komoditas Mingguan</h2>
        <p>
          Menampilkan 10 komoditas utama dalam tampilan ringkas 5 x 2 dan bisa
          dibuka detail tabelnya.
        </p>
      </div>
      {loading ? (
        <p>Memuat data harga...</p>
      ) : (
        <div className="commodityGridTen">
          {items.length === 0 && (
            <div className="emptyState">
              Belum ada data harga. Jalankan seeder atau koneksikan database
              produksi.
            </div>
          )}
          {items.slice(0, 10).map((item) => (
            <article className="commodityMini" key={item.nama_komoditas}>
              <img
                src={item.url_gambar}
                alt={item.nama_komoditas}
                onError={(e) => {
                  e.currentTarget.src = "/assets/images/komoditas/default.png";
                }}
              />
              <h3>{item.nama_komoditas}</h3>
              <strong>
                {rupiah(item.average_price ?? item.harga_sekarang)}
              </strong>
              <small className={item.tren}>
                Selisih {rupiah(Math.abs(item.selisih || 0))}
              </small>
            </article>
          ))}
        </div>
      )}
      <div className="center">
        <a className="btn outline" href="/informasi-pasar">
          Lihat Tabel Harga
        </a>
      </div>
    </section>
  );
}
