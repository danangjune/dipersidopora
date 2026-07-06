import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart, LineController, LineElement, PointElement,
  LinearScale, CategoryScale, Title, Tooltip, Legend, Filler,
} from "chart.js";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import AdjustmentsHorizontalIcon from "@heroicons/react/24/outline/AdjustmentsHorizontalIcon";
import TableCellsIcon from "@heroicons/react/24/outline/TableCellsIcon";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);

const COLORS = ["#076797", "#108879", "#e2a200", "#dc2626", "#7c3aed", "#0891b2", "#84cc16", "#f97316", "#ec4899", "#6366f1"];

export default function MarketPage() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const [filters, setFilters] = useState({ markets: [], commodities: [] });
  const [marketId, setMarketId] = useState("");
  const [selectedCommodities, setSelectedCommodities] = useState([]);
  const [rows, setRows] = useState([]);
  const [chartData, setChartData] = useState({ dates: [], series: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/market/filters")
      .then((r) => r.json())
      .then((d) => {
        const data = d.data || { markets: [], commodities: [] };
        setFilters(data);
        if (data.commodities.length > 0) setSelectedCommodities([data.commodities[0].id]);
      });
  }, []);

  const toggleCommodity = (id) => {
    setSelectedCommodities((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (marketId) q.set("market_id", marketId);
    if (selectedCommodities.length > 0) q.set("commodity_ids", selectedCommodities.join(","));
    return q.toString();
  }, [marketId, selectedCommodities]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/market/summary?${query}`).then((r) => r.json()),
      fetch(`/api/market/chart?${query}`).then((r) => r.json()),
    ])
      .then(([summary, chartResult]) => {
        setRows(summary?.data?.rows || []);
        setChartData(chartResult?.data || { dates: [], series: [] });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  useEffect(() => {
    if (!canvasRef.current || chartData.dates.length === 0) return;
    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.dates,
        datasets: chartData.series.map((s, i) => ({
          label: s.name,
          data: s.data,
          borderColor: COLORS[i % COLORS.length],
          backgroundColor: COLORS[i % COLORS.length] + "15",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 7,
          borderWidth: 2.5,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: "index" },
        plugins: {
          legend: { position: "bottom", labels: { padding: 20, usePointStyle: true, font: { size: 12, family: "Inter, sans-serif" } } },
          tooltip: {
            backgroundColor: "#0f2d52",
            titleFont: { size: 13, family: "Inter, sans-serif" },
            bodyFont: { size: 12, family: "Inter, sans-serif" },
            padding: 12,
            cornerRadius: 12,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${rupiah(ctx.parsed.y)}` },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11, family: "Inter, sans-serif" } } },
          y: {
            grid: { color: "#eef2f7" },
            ticks: { font: { size: 11, family: "Inter, sans-serif" }, callback: (v) => rupiah(v).replace(",00", "") },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [chartData]);

  const trenIcon = (t) => {
    if (t === "naik") return "▲";
    if (t === "turun") return "▼";
    return "—";
  };

  return (
    <section className="section marketPage">
      <div className="marketHero" style={{ backgroundImage: "url(/assets/images/komoditas/SIKAD.png)" }}>
        <div className="marketHeroOverlay" />
      </div>

      <div className="marketPageHeader">
        <ChartBarIcon style={{ width: 32, height: 32 }} />
        <div>
          <h1>Pemantauan Harga Komoditas</h1>
          <p>Data harga komoditas dari berbagai pasar di Kota Kediri diperbarui setiap hari.</p>
        </div>
      </div>

      <div className="filterCard">
        <div className="filterCardHeader">
          <AdjustmentsHorizontalIcon style={{ width: 20, height: 20 }} />
          <span>Filter Data</span>
        </div>
        <div className="filterCardBody">
          <div className="filterCardRow">
            <label>
              Pasar
              <select value={marketId} onChange={(e) => setMarketId(e.target.value)}>
                <option value="">Semua Pasar</option>
                {filters.markets.map((m) => (
                  <option value={m.id} key={m.id}>{m.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="filterCardDivider" />
          <div>
            <p className="filterCardLabel">Komoditas</p>
            <div className="checkboxGroup">
              {filters.commodities.map((c, i) => (
                <label key={c.id} className="checkboxLabel">
                  <input
                    type="checkbox"
                    checked={selectedCommodities.includes(c.id)}
                    onChange={() => toggleCommodity(c.id)}
                    style={{ accentColor: COLORS[i % COLORS.length] }}
                  />
                  <span>{c.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sectionSubhead">
        <h2>Grafik Harga</h2>
        <p>Perbandingan harga komoditas 7 hari terakhir.</p>
      </div>
      <div className="chartContainer">
        {loading && <p className="blank">Memuat grafik...</p>}
        {!loading && chartData.dates.length === 0 && <p className="blank">Belum ada data grafik.</p>}
        {!loading && chartData.dates.length > 0 && (
          <div className="chartWrapper">
            <canvas ref={canvasRef} />
          </div>
        )}
      </div>

      <div className="sectionSubhead">
        <h2>Harga Komoditas</h2>
        <p>Rata-rata harga komoditas 7 hari terakhir.</p>
      </div>
      <div className="marketCardGrid">
        {loading && <div className="blank">Memuat data harga...</div>}
        {!loading && rows.length === 0 && <div className="blank">Belum ada data untuk filter ini.</div>}
        {!loading &&
          rows.map((item) => {
            const tren = item.tren || "tetap";
            return (
              <article className="commodityCard" key={item.commodity_id}>
                <div className="commodityCardTop">
                  <img
                    src={item.url_gambar}
                    alt={item.nama_komoditas}
                    onError={(e) => { e.currentTarget.src = "/assets/images/komoditas/default.png"; }}
                  />
                  <h3>{item.nama_komoditas}</h3>
                </div>
                <div className="commodityCardBody">
                  <strong>{rupiah(item.average_price)}</strong>
                  <span className={`commodityTrend ${tren}`}>
                    <i>{trenIcon(tren)}</i> {rupiah(Math.abs(item.selisih || 0))}
                  </span>
                </div>
              </article>
            );
          })}
      </div>

      <div className="sectionSubhead" style={{marginTop:40}}>
        <h2>Tabel Harga Komoditas</h2>
        <p>Tabel lengkap rata-rata harga komoditas 7 hari terakhir.</p>
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
                <td><strong>{r.nama_komoditas}</strong></td>
                <td>{rupiah(r.average_price)}</td>
                <td>{rupiah(r.previous_average_price)}</td>
                <td><span className={`indicator ${r.tren}`}>{trenIcon(r.tren)} {rupiah(Math.abs(r.selisih))}</span></td>
                <td>{r.market_count}</td>
                <td>{r.latest_date || "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={7}><div className="emptyState"><TableCellsIcon style={{width:36,height:36}} /><p>Tidak ada data.</p></div></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
