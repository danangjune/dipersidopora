import { useEffect, useState } from "react";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import ChevronUpIcon from "@heroicons/react/24/outline/ChevronUpIcon";
import ArrowRightIcon from "@heroicons/react/24/outline/ArrowRightIcon";
import CalendarDaysIcon from "@heroicons/react/24/outline/CalendarDaysIcon";
import ArrowTrendingUpIcon from "@heroicons/react/24/solid/ArrowTrendingUpIcon";
import ArrowTrendingDownIcon from "@heroicons/react/24/solid/ArrowTrendingDownIcon";
import MinusIcon from "@heroicons/react/24/solid/MinusIcon";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const shortDate = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${value}T00:00:00+07:00`))
    : null;

export default function PriceWidget() {
  const [items, setItems] = useState([]);
  const [dataDate, setDataDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetch("/api/market/verified-average-last-day")
      .then((r) => r.json())
      .then((d) => {
        setItems(d?.data?.rows || []);
        setDataDate(d?.data?.date || null);
      })
      .finally(() => setLoading(false));
  }, []);

  const formattedDataDate = dataDate
    ? new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      }).format(new Date(`${dataDate}T00:00:00+07:00`))
    : null;

  const displayed = showAll ? items : items.slice(0, limit);
  const hasMore = items.length > limit;

  return (
    <section className="section">
      <div className="sectionTitle">
        <span>Harga Komoditas</span>
        <h2>Pantau Harga Komoditas Hari Ini</h2>
        <p>
          Rata-rata harga kebutuhan pokok pada satu hari dari berbagai pasar di
          Kota Kediri.
          {formattedDataDate && (
            <> Data terverifikasi terbaru: {formattedDataDate}.</>
          )}
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
              const trendLabel =
                tren === "naik" ? "Naik" : tren === "turun" ? "Turun" : "Tetap";

              return (
                <article className="commodityCard" key={item.commodity_id}>
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
                      <strong>{rupiah(item.average_price)}</strong>
                    </div>
                    <div className="commodityCardChange">
                      <span className={`commodityTrendBadge ${tren}`}>
                        <TrendIcon />
                        {trendLabel}
                      </span>
                      <span className="commodityTrendValue">
                        {tren === "naik" ? "+" : tren === "turun" ? "−" : ""}
                        {rupiah(Math.abs(item.selisih || 0))}
                      </span>
                    </div>
                    <div className="commodityCardPrev">
                      <span>Harga sebelumnya</span>
                      {rupiah(item.harga_sebelumnya)}
                    </div>
                    {item.latest_date && (
                      <div
                        className="commodityVerifiedDate"
                        title={`Data terverifikasi terakhir ${shortDate(item.latest_date)}`}
                      >
                        <CalendarDaysIcon />
                        <span>Verifikasi {shortDate(item.latest_date)}</span>
                      </div>
                    )}
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
