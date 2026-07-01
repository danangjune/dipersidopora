import { useEffect, useMemo, useState } from "react";

const rupiah = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v || 0);
const api = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Gagal memproses data");
  return data;
};

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function AdminTable({ columns, rows, empty = "Belum ada data." }) {
  return (
    <div className="tableWrap adminTable">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row, i) : row[c.key]}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{empty}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MasterData() {
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [marketForm, setMarketForm] = useState({
    name: "",
    category: "Pasar Rakyat",
    address: "",
    image: "",
    is_active: true,
  });
  const [commodityForm, setCommodityForm] = useState({
    name: "",
    unit: "kg",
    image: "",
    is_active: true,
  });
  const [message, setMessage] = useState("");
  const load = () =>
    Promise.all([
      api("/api/admin/markets"),
      api("/api/admin/commodities"),
    ]).then(([m, c]) => {
      setMarkets(m.data || []);
      setCommodities(c.data || []);
    });
  useEffect(() => {
    load();
  }, []);
  const saveMarket = async (e) => {
    e.preventDefault();
    setMessage("Menyimpan pasar...");
    await api("/api/admin/markets", {
      method: "POST",
      body: JSON.stringify(marketForm),
    });
    setMarketForm({
      name: "",
      category: "Pasar Rakyat",
      address: "",
      image: "",
      is_active: true,
    });
    await load();
    setMessage("Pasar berhasil disimpan.");
  };
  const saveCommodity = async (e) => {
    e.preventDefault();
    setMessage("Menyimpan komoditas...");
    await api("/api/admin/commodities", {
      method: "POST",
      body: JSON.stringify(commodityForm),
    });
    setCommodityForm({ name: "", unit: "kg", image: "", is_active: true });
    await load();
    setMessage("Komoditas berhasil disimpan.");
  };
  return (
    <div className="adminGrid">
      <form className="cardForm" onSubmit={saveMarket}>
        <h2>Tambah Pasar</h2>
        <TextInput
          label="Nama Pasar"
          value={marketForm.name}
          onChange={(v) => setMarketForm({ ...marketForm, name: v })}
        />
        <TextInput
          label="Kategori"
          value={marketForm.category}
          onChange={(v) => setMarketForm({ ...marketForm, category: v })}
        />
        <label>
          Alamat
          <textarea
            value={marketForm.address}
            onChange={(e) =>
              setMarketForm({ ...marketForm, address: e.target.value })
            }
          />
        </label>
        <TextInput
          label="Path Gambar"
          value={marketForm.image}
          placeholder="images/pasar/pasar bandar.jpg"
          onChange={(v) => setMarketForm({ ...marketForm, image: v })}
        />
        <button className="btn">Simpan Pasar</button>
      </form>
      <form className="cardForm" onSubmit={saveCommodity}>
        <h2>Tambah Komoditas</h2>
        <TextInput
          label="Nama Komoditas"
          value={commodityForm.name}
          onChange={(v) => setCommodityForm({ ...commodityForm, name: v })}
        />
        <TextInput
          label="Satuan"
          value={commodityForm.unit}
          onChange={(v) => setCommodityForm({ ...commodityForm, unit: v })}
        />
        <TextInput
          label="Nama Gambar"
          value={commodityForm.image}
          placeholder="beras.webp"
          onChange={(v) => setCommodityForm({ ...commodityForm, image: v })}
        />
        <button className="btn">Simpan Komoditas</button>
        {message && <p>{message}</p>}
      </form>
      <div>
        <h2>Data Pasar</h2>
        <AdminTable
          columns={[
            { key: "name", label: "Nama" },
            { key: "category", label: "Kategori" },
            { key: "address", label: "Alamat" },
            {
              key: "is_active",
              label: "Aktif",
              render: (r) => (r.is_active ? "Ya" : "Tidak"),
            },
          ]}
          rows={markets}
        />
      </div>
      <div>
        <h2>Data Komoditas</h2>
        <AdminTable
          columns={[
            { key: "name", label: "Nama" },
            { key: "unit", label: "Satuan" },
            { key: "image", label: "Gambar" },
            {
              key: "is_active",
              label: "Aktif",
              render: (r) => (r.is_active ? "Ya" : "Tidak"),
            },
          ]}
          rows={commodities}
        />
      </div>
    </div>
  );
}

function PriceManager() {
  const [filters, setFilters] = useState({ markets: [], commodities: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    pasar_id: "",
    komoditas_id: "",
    price_date: new Date().toISOString().slice(0, 10),
    price: "",
    status_validasi: "true",
    indicator_status: "belum_dikaji",
  });
  const [message, setMessage] = useState("");
  const load = () =>
    Promise.all([
      api("/api/market/filters"),
      api("/api/admin/prices?limit=100"),
    ]).then(([f, p]) => {
      setFilters(f.data || { markets: [], commodities: [] });
      setRows(p.data || []);
    });
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!form.pasar_id && filters.markets?.[0])
      setForm((f) => ({ ...f, pasar_id: filters.markets[0].id }));
    if (!form.komoditas_id && filters.commodities?.[0])
      setForm((f) => ({ ...f, komoditas_id: filters.commodities[0].id }));
  }, [filters]);
  const selectedCommodity = filters.commodities.find(
    (c) => String(c.id) === String(form.komoditas_id),
  );
  const save = async (e) => {
    e.preventDefault();
    setMessage("Menyimpan harga...");
    await api("/api/admin/prices", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        unit: selectedCommodity?.unit || "kg",
      }),
    });
    setForm({ ...form, price: "" });
    await load();
    setMessage("Harga berhasil disimpan.");
  };
  return (
    <div>
      <form className="cardForm wide" onSubmit={save}>
        <h2>Input Harga Komoditas</h2>
        <label>
          Pasar
          <select
            value={form.pasar_id}
            onChange={(e) => setForm({ ...form, pasar_id: e.target.value })}
          >
            {filters.markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Komoditas
          <select
            value={form.komoditas_id}
            onChange={(e) => setForm({ ...form, komoditas_id: e.target.value })}
          >
            {filters.commodities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <TextInput
          type="date"
          label="Tanggal"
          value={form.price_date}
          onChange={(v) => setForm({ ...form, price_date: v })}
        />
        <TextInput
          type="number"
          label="Harga"
          value={form.price}
          onChange={(v) => setForm({ ...form, price: v })}
        />
        <label>
          Status Validasi
          <select
            value={form.status_validasi}
            onChange={(e) =>
              setForm({ ...form, status_validasi: e.target.value })
            }
          >
            <option value="true">Valid</option>
            <option value="pending">Pending</option>
            <option value="false">Ditolak</option>
          </select>
        </label>
        <label>
          Indikator
          <select
            value={form.indicator_status}
            onChange={(e) =>
              setForm({ ...form, indicator_status: e.target.value })
            }
          >
            <option value="belum_dikaji">Belum Dikaji</option>
            <option value="aman">Aman</option>
            <option value="waspada">Waspada</option>
            <option value="intervensi">Intervensi</option>
          </select>
        </label>
        <button className="btn">Simpan Harga</button>
        <a className="btn outline" href="/api/admin/prices/export">
          Download Excel
        </a>
        {message && <p>{message}</p>}
      </form>
      <h2>Data Harga Terbaru</h2>
      <AdminTable
        columns={[
          {
            key: "price_date",
            label: "Tanggal",
            render: (r) => r.price_date?.slice(0, 10),
          },
          { key: "pasar", label: "Pasar", render: (r) => r.pasar?.name },
          {
            key: "komoditas",
            label: "Komoditas",
            render: (r) => r.komoditas?.name,
          },
          { key: "price", label: "Harga", render: (r) => rupiah(r.price) },
          { key: "indicator_status", label: "Indikator" },
          { key: "status_validasi", label: "Validasi" },
        ]}
        rows={rows}
      />
    </div>
  );
}

function HetHapManager() {
  const [filters, setFilters] = useState({ markets: [], commodities: [] });
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    komoditas_id: "",
    pasar_id: "",
    type: "HAP",
    price: "",
    effective_date: new Date().toISOString().slice(0, 10),
    is_active: true,
    notes: "",
  });
  const load = () =>
    Promise.all([api("/api/market/filters"), api("/api/admin/het-hap")]).then(
      ([f, s]) => {
        setFilters(f.data || { markets: [], commodities: [] });
        setRows(s.data || []);
      },
    );
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!form.komoditas_id && filters.commodities?.[0])
      setForm((f) => ({ ...f, komoditas_id: filters.commodities[0].id }));
  }, [filters]);
  const save = async (e) => {
    e.preventDefault();
    await api("/api/admin/het-hap", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        pasar_id: form.pasar_id || null,
        price: Number(form.price),
      }),
    });
    setForm({ ...form, price: "" });
    await load();
  };
  return (
    <div>
      <form className="cardForm wide" onSubmit={save}>
        <h2>Atur HET/HAP</h2>
        <label>
          Komoditas
          <select
            value={form.komoditas_id}
            onChange={(e) => setForm({ ...form, komoditas_id: e.target.value })}
          >
            {filters.commodities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Pasar Opsional
          <select
            value={form.pasar_id}
            onChange={(e) => setForm({ ...form, pasar_id: e.target.value })}
          >
            <option value="">Semua Pasar</option>
            {filters.markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tipe
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="HAP">HAP</option>
            <option value="HET">HET</option>
          </select>
        </label>
        <TextInput
          type="number"
          label="Nilai"
          value={form.price}
          onChange={(v) => setForm({ ...form, price: v })}
        />
        <TextInput
          type="date"
          label="Berlaku Mulai"
          value={form.effective_date}
          onChange={(v) => setForm({ ...form, effective_date: v })}
        />
        <button className="btn">Simpan HET/HAP</button>
      </form>
      <AdminTable
        columns={[
          { key: "komoditas_name", label: "Komoditas" },
          {
            key: "pasar_name",
            label: "Pasar",
            render: (r) => r.pasar_name || "Semua",
          },
          { key: "type", label: "Tipe" },
          { key: "price", label: "Nilai", render: (r) => rupiah(r.price) },
          { key: "effective_date", label: "Berlaku" },
        ]}
        rows={rows}
      />
    </div>
  );
}

function CmsManager() {
  const [pages, setPages] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [survey, setSurvey] = useState([]);
  const [pageForm, setPageForm] = useState({
    title: "",
    slug: "",
    group: "Profil",
    eyebrow: "",
    image: "",
    excerpt: "",
    content: "",
    is_published: true,
  });
  const [downloadForm, setDownloadForm] = useState({
    title: "",
    category: "renja",
    file_path: "",
    is_published: true,
  });
  const [surveyForm, setSurveyForm] = useState({
    title: "Survey Kepuasan Masyarakat",
    external_url: "",
    qr_image: "images/IKM survey 1.png",
    description: "Survey mengacu pada SKM KemenPANRB.",
    is_active: true,
  });
  const load = () =>
    Promise.all([
      api("/api/admin/pages"),
      api("/api/admin/downloads"),
      api("/api/admin/survey-settings"),
    ]).then(([p, d, s]) => {
      setPages(p.data || []);
      setDownloads(d.data || []);
      setSurvey(s.data || []);
    });
  useEffect(() => {
    load();
  }, []);
  const savePage = async (e) => {
    e.preventDefault();
    await api("/api/admin/pages", {
      method: "POST",
      body: JSON.stringify(pageForm),
    });
    setPageForm({ ...pageForm, title: "", slug: "", content: "", excerpt: "" });
    await load();
  };
  const saveDownload = async (e) => {
    e.preventDefault();
    await api("/api/admin/downloads", {
      method: "POST",
      body: JSON.stringify(downloadForm),
    });
    setDownloadForm({ ...downloadForm, title: "", file_path: "" });
    await load();
  };
  const saveSurvey = async (e) => {
    e.preventDefault();
    await api("/api/admin/survey-settings", {
      method: "POST",
      body: JSON.stringify(surveyForm),
    });
    await load();
  };
  return (
    <div className="adminGrid">
      <form className="cardForm" onSubmit={savePage}>
        <h2>Web Profil Dinamis</h2>
        <TextInput
          label="Judul"
          value={pageForm.title}
          onChange={(v) => setPageForm({ ...pageForm, title: v })}
        />
        <TextInput
          label="Slug"
          value={pageForm.slug}
          placeholder="contoh: profil-dinas"
          onChange={(v) => setPageForm({ ...pageForm, slug: v })}
        />
        <TextInput
          label="Grup"
          value={pageForm.group}
          onChange={(v) => setPageForm({ ...pageForm, group: v })}
        />
        <TextInput
          label="Gambar"
          value={pageForm.image}
          placeholder="images/office.png"
          onChange={(v) => setPageForm({ ...pageForm, image: v })}
        />
        <label>
          Ringkasan
          <textarea
            value={pageForm.excerpt}
            onChange={(e) =>
              setPageForm({ ...pageForm, excerpt: e.target.value })
            }
          />
        </label>
        <label>
          Konten
          <textarea
            value={pageForm.content}
            onChange={(e) =>
              setPageForm({ ...pageForm, content: e.target.value })
            }
          />
        </label>
        <button className="btn">Simpan Halaman</button>
      </form>
      <div>
        <h2>Halaman Lama & Baru</h2>
        <AdminTable
          columns={[
            { key: "title", label: "Judul" },
            { key: "slug", label: "Slug" },
            { key: "group", label: "Grup" },
            {
              key: "is_published",
              label: "Publish",
              render: (r) => (r.is_published ? "Ya" : "Tidak"),
            },
          ]}
          rows={pages}
        />
      </div>
      <form className="cardForm" onSubmit={saveDownload}>
        <h2>Dokumen Unduhan</h2>
        <TextInput
          label="Judul"
          value={downloadForm.title}
          onChange={(v) => setDownloadForm({ ...downloadForm, title: v })}
        />
        <TextInput
          label="Kategori"
          value={downloadForm.category}
          onChange={(v) => setDownloadForm({ ...downloadForm, category: v })}
        />
        <TextInput
          label="Path File"
          value={downloadForm.file_path}
          placeholder="aset_download/Dokumen.pdf"
          onChange={(v) => setDownloadForm({ ...downloadForm, file_path: v })}
        />
        <button className="btn">Simpan Dokumen</button>
        <AdminTable
          columns={[
            { key: "title", label: "Judul" },
            { key: "category", label: "Kategori" },
            { key: "file_path", label: "File" },
          ]}
          rows={downloads}
        />
      </form>
      <form className="cardForm" onSubmit={saveSurvey}>
        <h2>Survey / Barcode SKM</h2>
        <TextInput
          label="Judul"
          value={surveyForm.title}
          onChange={(v) => setSurveyForm({ ...surveyForm, title: v })}
        />
        <TextInput
          label="Link Survey KemenPANRB"
          value={surveyForm.external_url}
          onChange={(v) => setSurveyForm({ ...surveyForm, external_url: v })}
        />
        <TextInput
          label="Path Barcode/QR"
          value={surveyForm.qr_image}
          onChange={(v) => setSurveyForm({ ...surveyForm, qr_image: v })}
        />
        <label>
          Deskripsi
          <textarea
            value={surveyForm.description}
            onChange={(e) =>
              setSurveyForm({ ...surveyForm, description: e.target.value })
            }
          />
        </label>
        <button className="btn">Simpan Survey</button>
        <AdminTable
          columns={[
            { key: "title", label: "Judul" },
            { key: "external_url", label: "Link" },
            { key: "qr_image", label: "QR" },
          ]}
          rows={survey}
        />
      </form>
    </div>
  );
}

export default function AdminPage() {
  const tabs = ["dashboard", "master", "harga", "het-hap", "cms"];
  const [active, setActive] = useState("dashboard");
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api("/api/admin/dashboard")
      .then((d) => setStats(d.data))
      .catch(() => null);
  }, []);
  return (
    <section className="section adminPage">
      <div className="sectionTitle">
        <span>Admin Page</span>
        <h1>Pengelolaan Dinamis DISPERDAGIN</h1>
        <p>
          Fitur prioritas: pasar, komoditas, harga, HET/HAP, web profil,
          survey/SKM, dan export Excel. Scaffold ini tinggal dipasang auth
          sebelum production.
        </p>
      </div>
      <div className="adminTabs">
        {tabs.map((t) => (
          <button
            className={active === t ? "active" : ""}
            onClick={() => setActive(t)}
            key={t}
          >
            {t === "het-hap" ? "HET/HAP" : t.toUpperCase()}
          </button>
        ))}
      </div>
      {active === "dashboard" && (
        <div className="statGrid">
          {stats &&
            Object.entries(stats).map(([k, v]) => (
              <div key={k}>
                <span>{k.replaceAll("_", " ")}</span>
                <strong>{v}</strong>
              </div>
            ))}
        </div>
      )}
      {active === "master" && <MasterData />}
      {active === "harga" && <PriceManager />}
      {active === "het-hap" && <HetHapManager />}
      {active === "cms" && <CmsManager />}
    </section>
  );
}
