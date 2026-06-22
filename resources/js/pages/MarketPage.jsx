import { useEffect, useMemo, useState } from 'react';

const rupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
const today = new Date();
const iso = (date) => date.toISOString().slice(0, 10);
const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);

function IndicatorBadge({ status }) {
  if (!status) return null;
  const label = { aman: 'Aman', waspada: 'Waspada', intervensi: 'Intervensi', belum_dikaji: 'Belum Dikaji' }[status] || status;
  return <span className={`indicator ${status}`}>{label}</span>;
}

export default function MarketPage({ internal = false }) {
  const params = new URLSearchParams(window.location.search);
  const isInternal = internal || params.get('internal') === '1';
  const [filters, setFilters] = useState({ markets: [], commodities: [] });
  const [marketId, setMarketId] = useState(params.get('market_id') || '');
  const [commodityId, setCommodityId] = useState(params.get('commodity_id') || '');
  const [startDate, setStartDate] = useState(params.get('start_date') || iso(weekAgo));
  const [endDate, setEndDate] = useState(params.get('end_date') || iso(today));
  const [rows, setRows] = useState([]);
  const [chart, setChart] = useState([]);
  const [adminAverages, setAdminAverages] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/market/filters').then(r => r.json()).then(d => {
      const data = d.data || { markets: [], commodities: [] };
      setFilters(data);
      if (!marketId && data.markets?.[0]) setMarketId(String(data.markets[0].id));
    });
  }, []);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (marketId) q.set('market_id', marketId);
    if (commodityId) q.set('commodity_id', commodityId);
    if (startDate) q.set('start_date', startDate);
    if (endDate) q.set('end_date', endDate);
    if (isInternal) q.set('internal', '1');
    return q.toString();
  }, [marketId, commodityId, startDate, endDate, isInternal]);

  const load = () => {
    if (!marketId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/market/summary?${query}`).then(r => r.json()),
      fetch(`/api/market/chart?${query}`).then(r => r.json()),
      isInternal ? fetch(`/api/market/admin-averages?${query}`).then(r => r.json()) : Promise.resolve(null),
    ]).then(([summary, chartData, avg]) => {
      setRows(summary?.data?.rows || []);
      setChart(chartData?.data || []);
      setAdminAverages(avg?.data || null);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  const maxChart = Math.max(...chart.map(item => Number(item.average_price) || 0), 1);

  return <section className="section marketPage">
    <div className="sectionTitle">
      <span>{isInternal ? 'Internal / Admin' : 'Informasi Pasar'}</span>
      <h1>Harga Rata-rata Komoditas</h1>
      <p>Filter utama dimulai dari pasar, lalu tanggal dan komoditas. Default grafik dan tabel memakai periode satu minggu sesuai hasil rapat.</p>
    </div>

    <div className="filterPanel">
      <label>Pasar<select value={marketId} onChange={e => setMarketId(e.target.value)}>
        <option value="">Pilih pasar...</option>
        {filters.markets.map(m => <option value={m.id} key={m.id}>{m.name}</option>)}
      </select></label>
      <label>Dari Tanggal<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
      <label>Sampai Tanggal<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
      <label>Komoditas<select value={commodityId} onChange={e => setCommodityId(e.target.value)}>
        <option value="">Semua komoditas</option>
        {filters.commodities.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
      </select></label>
      <a className="btn outline" href={isInternal ? '/informasi-pasar' : '/internal/harga'}>{isInternal ? 'Mode Masyarakat' : 'Mode Internal'}</a>
      {isInternal && <a className="btn" href={`/api/admin/prices/export?${query}`}>Download Excel</a>}
    </div>

    <div className="sectionSubhead"><h2>Komoditas Utama</h2><p>Gambar diperkecil dalam formasi 5 x 2. Harga yang tampil adalah rata-rata periode filter.</p></div>
    <div className="commodityGridTen">
      {loading && <div className="emptyState">Memuat data harga...</div>}
      {!loading && rows.length === 0 && <div className="emptyState">Belum ada data untuk filter ini.</div>}
      {!loading && rows.slice(0, 10).map(item => <article className="commodityMini" key={item.commodity_id}>
        <img src={item.url_gambar} alt={item.nama_komoditas} onError={(e)=>{e.currentTarget.src='/assets/images/komoditas/default.png'}} />
        <h3>{item.nama_komoditas}</h3>
        <strong>{rupiah(item.average_price)}</strong>
        <small>/{item.unit || 'satuan'} · <span className={item.tren}>{item.tren}</span></small>
      </article>)}
    </div>

    <div className="sectionSubhead"><h2>Tabel Harga Komoditas</h2><p>{isInternal ? 'Tabel internal menampilkan HET/HAP dan indikator.' : 'Tabel masyarakat umum tidak menampilkan kolom indikator.'}</p></div>
    <div className="tableWrap"><table><thead><tr>
      <th>No</th><th>Komoditas</th><th>Rata-rata 1 Minggu</th><th>Harga Sebelumnya</th><th>Selisih</th><th>Pasar Terisi</th><th>Tanggal Update</th>
      {isInternal && <><th>HET</th><th>HAP</th><th>Indikator</th></>}
    </tr></thead><tbody>
      {rows.map((r,i) => <tr key={r.commodity_id}><td>{i+1}</td><td>{r.nama_komoditas}</td><td>{rupiah(r.average_price)}</td><td>{rupiah(r.previous_average_price)}</td><td className={r.tren}>{rupiah(Math.abs(r.selisih))}</td><td>{r.market_count}</td><td>{r.latest_date || '-'}</td>{isInternal && <><td>{r.het_price ? rupiah(r.het_price) : '-'}</td><td>{r.hap_price ? rupiah(r.hap_price) : '-'}</td><td><IndicatorBadge status={r.indicator_status} /></td></>}</tr>)}
      {rows.length === 0 && !loading && <tr><td colSpan={isInternal ? 10 : 7}>Tidak ada data.</td></tr>}
    </tbody></table></div>

    <div className="sectionSubhead"><h2>Grafik Harga</h2><p>Grafik sederhana berdasarkan tanggal dan komoditas dari filter yang sama.</p></div>
    <div className="chartBox">
      {chart.length === 0 && <p>Belum ada data grafik.</p>}
      {chart.map((item, index) => <div className="barRow" key={`${item.price_date}-${item.commodity_name}-${index}`}>
        <span>{item.price_date} · {item.commodity_name}</span>
        <div><i style={{ width: `${Math.max(8, (Number(item.average_price) / maxChart) * 100)}%` }} /></div>
        <strong>{rupiah(item.average_price)}</strong>
      </div>)}
    </div>

    {isInternal && adminAverages && <div className="sectionSubhead"><h2>Rata-rata Internal</h2><p>Ringkasan mingguan, bulanan, dan tahunan per komoditas.</p></div>}
    {isInternal && adminAverages && <div className="avgGrid">
      {Object.entries(adminAverages).map(([period, data]) => <div className="summaryCard" key={period}><h3>{period === 'weekly' ? 'Mingguan' : period === 'monthly' ? 'Bulanan' : 'Tahunan'}</h3>{data.slice(0, 8).map(row => <p key={`${period}-${row.id}`}><strong className="inlineStrong">{row.name}</strong> {rupiah(row.average_price)}</p>)}</div>)}
    </div>}
  </section>;
}
