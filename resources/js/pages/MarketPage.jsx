import { useEffect, useMemo, useState } from "react";

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
const today = new Date();
const iso = (date) => date.toISOString().slice(0, 10);
const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

export default function MarketPage() {
  const params = new URLSearchParams(window.location.search);
  const [filters, setFilters] = useState({ markets: [], commodities: [] });
  const [marketId, setMarketId] = useState(params.get("market_id") || "");
  const [commodityId, setCommodityId] = useState(
    params.get("commodity_id") || "",
  );
  const [startDate, setStartDate] = useState(
    params.get("start_date") || iso(weekAgo),
  );
  const [endDate, setEndDate] = useState(params.get("end_date") || iso(today));
  const [rows, setRows] = useState([]);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/market/filters")
      .then((r) => r.json())
      .then((d) => {
        const data = d.data || { markets: [], commodities: [] };
        setFilters(data);
      });
  }, []);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (marketId) q.set("market_id", marketId);
    if (commodityId) q.set("commodity_id", commodityId);
    if (startDate) q.set("start_date", startDate);
    if (endDate) q.set("end_date", endDate);
    return q.toString();
  }, [marketId, commodityId, startDate, endDate]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/market/summary?${query}`).then((r) => r.json()),
      fetch(`/api/market/chart?${query}`).then((r) => r.json()),
    ])
      .then(([summary, chartData]) => {
        setRows(summary?.data?.rows || []);
        setChart(chartData?.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [query]);

  const maxChart = Math.max(
    ...chart.map((item) => Number(item.average_price) || 0),
    1,
  );

  return (
    <section className="section marketPage">
      <div className="sectionTitle">
        <span>Informasi Pasar</span>
        <h1>Harga Rata-rata Komoditas</h1>
        <p>
          Filter berdasarkan pasar, tanggal, atau komoditas. Default
          menampilkan rata-rata semua pasar periode satu minggu.
        </p>
      </div>

      <div className="filterPanel">
        <label>
          Pasar
          <select
            value={marketId}
            onChange={(e) => setMarketId(e.target.value)}
          >
            <option value="">Semua Pasar</option>
            {filters.markets.map((m) => (
              <option value={m.id} key={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dari Tanggal
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          Sampai Tanggal
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label>
          Komoditas
          <select
            value={commodityId}
            onChange={(e) => setCommodityId(e.target.value)}
          >
            <option value="">Semua komoditas</option>
            {filters.commodities.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sectionSubhead">
        <h2>Komoditas Utama</h2>
        <p>
          Semua komoditas aktif ditampilkan. Harga yang tampil adalah
          rata-rata periode filter.
        </p>
      </div>
      <div className="commodityGridTen">
        {loading && <div className="emptyState">Memuat data harga...</div>}
        {!loading && rows.length === 0 && (
          <div className="emptyState">Belum ada data untuk filter ini.</div>
        )}
        {!loading &&
          rows.map((item) => (
            <article className="commodityMini" key={item.commodity_id}>
              <img
                src={item.url_gambar}
                alt={item.nama_komoditas}
                onError={(e) => {
                  e.currentTarget.src = "/assets/images/komoditas/default.png";
                }}
              />
              <h3>{item.nama_komoditas}</h3>
              <strong>{rupiah(item.average_price)}</strong>
              <small>
                /{item.unit || "satuan"} ·{" "}
                <span className={item.tren}>{item.tren}</span>
              </small>
            </article>
          ))}
      </div>

      <div className="sectionSubhead">
        <h2>Tabel Harga Komoditas</h2>
        <p>
          Tabel harga rata-rata komoditas per periode filter.
        </p>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Komoditas</th>
              <th>Rata-rata 1 Minggu</th>
              <th>Harga Sebelumnya</th>
              <th>Selisih</th>
              <th>Pasar Terisi</th>
              <th>Tanggal Update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.commodity_id}>
                <td>{i + 1}</td>
                <td>{r.nama_komoditas}</td>
                <td>{rupiah(r.average_price)}</td>
                <td>{rupiah(r.previous_average_price)}</td>
                <td className={r.tren}>{rupiah(Math.abs(r.selisih))}</td>
                <td>{r.market_count}</td>
                <td>{r.latest_date || "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={7}>Tidak ada data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sectionSubhead">
        <h2>Grafik Harga</h2>
        <p>
          Grafik sederhana berdasarkan tanggal dan komoditas dari filter yang
          sama.
        </p>
      </div>
      <div className="chartBox">
        {chart.length === 0 && <p>Belum ada data grafik.</p>}
        {chart.map((item, index) => (
          <div
            className="barRow"
            key={`${item.price_date}-${item.commodity_name}-${index}`}
          >
            <span>
              {item.price_date} · {item.commodity_name}
            </span>
            <div>
              <i
                style={{
                  width: `${Math.max(8, (Number(item.average_price) / maxChart) * 100)}%`,
                }}
              />
            </div>
            <strong>{rupiah(item.average_price)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
