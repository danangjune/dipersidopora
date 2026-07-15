import { useEffect, useState } from "react";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import ArrowTrendingUpIcon from "@heroicons/react/24/solid/ArrowTrendingUpIcon";
import ArrowTrendingDownIcon from "@heroicons/react/24/solid/ArrowTrendingDownIcon";
import MinusIcon from "@heroicons/react/24/solid/MinusIcon";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function PriceWidget() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetch("/api/market/summary")
      .then((r) => r.json())
      .then((d) => setItems(d?.data?.rows || d?.data?.list_komoditas || []))
      .finally(() => setLoading(false));
  }, []);

  const displayed = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <section className="section">
      <div className="sectionTitle">
        <span>Harga Komoditas</span>
        <h2>Pantau Harga Komoditas Hari Ini</h2>
        <p>
          Data harga kebutuhan pokok terkini dari berbagai pasar di Kota Kediri
          diperbarui setiap hari.
        </p>
      </div>

      {loading ? (
        <div className="loadingState">
          <div className="loadingSpinner" />
          <p>Memuat data harga...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="emptyState">
          <ChartBarIcon style={{ width: 48, height: 48 }} />
          <p>Belum ada data harga tersedia.</p>
        </div>
      ) : (
        <>
          <div className="commodityGridTen">
            {displayed.map((item) => {
              const tren = item.tren || "tetap";
              const TrendIcon =
                tren === "naik"
                  ? ArrowTrendingUpIcon
                  : tren === "turun"
                    ? ArrowTrendingDownIcon
                    : MinusIcon;
              return (
                <article className="commodityCard" key={item.nama_komoditas}>
                  <div className="commodityCardTop">
                    {item.url_gambar && (
                      <img
                        src={item.url_gambar}
                        alt={item.nama_komoditas}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <h3>{item.nama_komoditas}</h3>
                  </div>
                  <div className="commodityCardBody">
                    <div className="commodityCardPrice">
                      <strong>
                        {rupiah(item.harga_sekarang)}
                      </strong>
                      <span className={`commodityTrendBadge ${tren}`}>
                        <TrendIcon style={{ width: 14, height: 14 }} />
                        {rupiah(Math.abs(item.selisih || 0))}
                      </span>
                    </div>
                    <div className="commodityCardPrev">
                      <span>Sebelumnya </span>
                      {rupiah(item.harga_sebelumnya)}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="center">
            {hasMore && (
              <button
                className="btn outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUpIcon style={{ width: 18, height: 18 }} />
                    Tampilkan Lebih Sedikit
                  </>
                ) : (
                  <>
                    <ChevronDownIcon style={{ width: 18, height: 18 }} />
                    Tampilkan Semua ({items.length} Komoditas)
                  </>
                )}
              </button>
            )}
            <a className="btn" href="/informasi-pasar" style={{ marginLeft: 12 }}>
              <ChartBarIcon style={{ width: 18, height: 18 }} />
              Detail Tabel & Grafik
              <ArrowRightIcon style={{ width: 16, height: 16 }} />
            </a>
          </div>
        </>
      )}
    </section>
  );
}
