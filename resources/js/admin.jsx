import "./bootstrap";
import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useState } from "react";

const csrf = document
  .querySelector('meta[name="csrf-token"]')
  ?.getAttribute("content");

async function api(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrf,
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan saat memproses data.");
  }

  return data;
}

const resources = {
  markets: {
    title: "Master Pasar",
    endpoint: "/api/admin/markets",
    fields: [
      { name: "name", label: "Nama Pasar", required: true },
      { name: "category", label: "Kategori" },
      { name: "address", label: "Alamat", type: "textarea" },
      { name: "image", label: "Path Gambar" },
      { name: "latitude", label: "Latitude", type: "number" },
      { name: "longitude", label: "Longitude", type: "number" },
      { name: "sort_order", label: "Urutan", type: "number" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
    ],
    columns: ["name", "category", "address", "is_active"],
    defaults: {
      name: "",
      category: "Pasar Rakyat",
      address: "",
      image: "",
      latitude: "",
      longitude: "",
      sort_order: 0,
      is_active: true,
    },
  },
  commodities: {
    title: "Master Komoditas",
    endpoint: "/api/admin/commodities",
    fields: [
      { name: "name", label: "Nama Komoditas", required: true },
      { name: "unit", label: "Satuan" },
      { name: "image", label: "Gambar" },
      { name: "sort_order", label: "Urutan", type: "number" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
    ],
    columns: ["name", "unit", "image", "is_active"],
    defaults: {
      name: "",
      unit: "kg",
      image: "",
      sort_order: 0,
      is_active: true,
    },
  },
  pages: {
    title: "Master Halaman Web",
    endpoint: "/api/admin/pages",
    fields: [
      { name: "title", label: "Judul", required: true },
      { name: "slug", label: "Slug" },
      { name: "group", label: "Grup" },
      { name: "eyebrow", label: "Eyebrow" },
      { name: "image", label: "Gambar" },
      { name: "external_url", label: "Link Eksternal" },
      { name: "excerpt", label: "Ringkasan", type: "textarea" },
      { name: "content", label: "Konten", type: "textarea" },
      { name: "sort_order", label: "Urutan", type: "number" },
      { name: "is_published", label: "Publish", type: "checkbox" },
    ],
    columns: ["title", "slug", "group", "is_published"],
    defaults: {
      title: "",
      slug: "",
      group: "Profil",
      eyebrow: "",
      image: "",
      external_url: "",
      excerpt: "",
      content: "",
      sort_order: 0,
      is_published: true,
    },
  },
  downloads: {
    title: "Master Dokumen Unduhan",
    endpoint: "/api/admin/downloads",
    fields: [
      { name: "title", label: "Judul", required: true },
      { name: "category", label: "Kategori", required: true },
      { name: "file_path", label: "Path File", required: true },
      { name: "sort_order", label: "Urutan", type: "number" },
      { name: "is_published", label: "Publish", type: "checkbox" },
    ],
    columns: ["title", "category", "file_path", "is_published"],
    defaults: {
      title: "",
      category: "renja",
      file_path: "",
      sort_order: 0,
      is_published: true,
    },
  },
  "het-hap": {
    title: "HET / HAP",
    endpoint: "/api/admin/het-hap",
    fields: [
      { name: "type", label: "Tipe", type: "select", required: true, options: [["HET", "HET (Harga Eceran Tertinggi)"], ["HAP", "HAP (Harga Acuan Pasar)"]] },
      { name: "komoditas_id", label: "Komoditas", type: "select", required: true, optionsUrl: "/api/admin/commodities" },
      { name: "pasar_id", label: "Pasar (Opsional)", type: "select", optionsUrl: "/api/admin/markets" },
      { name: "price", label: "Harga", type: "number", required: true },
      { name: "effective_date", label: "Tanggal Berlaku", type: "date" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
      { name: "notes", label: "Catatan", type: "textarea" },
    ],
    columns: ["type", "komoditas_name", "pasar_name", "price", "effective_date", "is_active"],
    defaults: {
      type: "HAP",
      komoditas_id: "",
      pasar_id: "",
      price: 0,
      effective_date: "",
      is_active: true,
      notes: "",
    },
  },
  banners: {
    title: "Banner Slider",
    endpoint: "/api/admin/banners",
    fields: [
      { name: "title", label: "Judul" },
      { name: "image", label: "Path Gambar", required: true },
      { name: "link_url", label: "Link URL" },
      { name: "sort_order", label: "Urutan", type: "number" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
    ],
    columns: ["title", "image", "is_active"],
    defaults: { title: "", image: "", link_url: "", sort_order: 0, is_active: true },
  },
  "survey-settings": {
    title: "Master Survey / SKM",
    endpoint: "/api/admin/survey-settings",
    fields: [
      { name: "title", label: "Judul", required: true },
      { name: "external_url", label: "Link Survey" },
      { name: "qr_image", label: "Path QR Image" },
      { name: "description", label: "Deskripsi", type: "textarea" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
    ],
    columns: ["title", "external_url", "qr_image", "is_active"],
    defaults: {
      title: "Survey Kepuasan Masyarakat",
      external_url: "",
      qr_image: "",
      description: "",
      is_active: true,
    },
  },
};

const menus = [
  { key: "dashboard", label: "Dashboard", href: "/admin" },
  { key: "prices-monitor", label: "Pemantauan Harga", href: "/admin/prices-monitor" },
  { key: "markets", label: "Master Pasar", href: "/admin/markets" },
  { key: "commodities", label: "Master Komoditas", href: "/admin/commodities" },
  { key: "pages", label: "Master Halaman", href: "/admin/pages" },
  { key: "downloads", label: "Master Dokumen", href: "/admin/downloads" },
  { key: "banners", label: "Banner Slider", href: "/admin/banners" },
  {
    key: "het-hap",
    label: "HET / HAP",
    href: "/admin/het-hap",
  },
  {
    key: "survey-settings",
    label: "Master Survey",
    href: "/admin/survey-settings",
  },
];

function getActiveKey() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[1] || "dashboard";
}

function boolLabel(value) {
  return value ? "Ya" : "Tidak";
}

function normalizePayload(form, fields) {
  const payload = {};

  fields.forEach((field) => {
    const value = form[field.name];

    if (field.type === "checkbox") {
      payload[field.name] = Boolean(value);
    } else if (field.type === "number") {
      payload[field.name] =
        value === "" || value === null ? null : Number(value);
    } else if (field.type === "select") {
      payload[field.name] = value === "" ? null : Number(value) || value;
    } else {
      payload[field.name] = value ?? "";
    }
  });

  return payload;
}

function AdminLayout({ children }) {
  const activeKey = getActiveKey();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>DISPERDAGIN</strong>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-menu">
          {menus.map((menu) => (
            <a
              key={menu.key}
              href={menu.href}
              className={activeKey === menu.key ? "active" : ""}
            >
              {menu.label}
            </a>
          ))}
        </nav>

        <form method="POST" action="/logout" className="admin-logout">
          <input type="hidden" name="_token" value={csrf} />
          <button type="submit">Logout</button>
        </form>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api("/api/admin/dashboard")
      .then((result) => setStats(result.data || {}))
      .catch(() => setStats({}));
  }, []);

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Dashboard</p>
          <h1>Ringkasan Admin</h1>
        </div>
      </div>

      <div className="admin-stats">
        {stats ? (
          Object.entries(stats).map(([key, value]) => (
            <div className="admin-stat-card" key={key}>
              <span>{key.replaceAll("_", " ")}</span>
              <strong>{value}</strong>
            </div>
          ))
        ) : (
          <p>Memuat data...</p>
        )}
      </div>
    </>
  );
}

function CrudPage({ config }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(config.defaults);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldOptions, setFieldOptions] = useState({});

  const fields = config.fields;

  const loadRows = async () => {
    setLoading(true);
    try {
      const result = await api(config.endpoint);
      setRows(result.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [config.endpoint]);

  useEffect(() => {
    const urls = fields
      .filter((f) => f.type === "select" && f.optionsUrl)
      .map((f) => f.optionsUrl);
    if (urls.length === 0) return;
    Promise.all(
      urls.map(async (url) => {
        try {
          const res = await api(url);
          return { url, data: res.data || [] };
        } catch {
          return { url, data: [] };
        }
      }),
    ).then((results) => {
      const map = {};
      results.forEach(({ url, data }) => {
        map[url] = data;
      });
      setFieldOptions(map);
    });
  }, [config.endpoint]);

  const resetForm = () => {
    setForm(config.defaults);
    setEditing(null);
    setMessage("");
  };

  const submit = async (event) => {
    event.preventDefault();

    const payload = normalizePayload(form, fields);
    const url = editing ? `${config.endpoint}/${editing.id}` : config.endpoint;
    const method = editing ? "PATCH" : "POST";

    await api(url, {
      method,
      body: JSON.stringify(payload),
    });

    setMessage(
      editing ? "Data berhasil diperbarui." : "Data berhasil ditambahkan.",
    );
    resetForm();
    await loadRows();
  };

  const editRow = (row) => {
    const next = { ...config.defaults };

    fields.forEach((field) => {
      next[field.name] = row[field.name] ?? config.defaults[field.name] ?? "";
    });

    setForm(next);
    setEditing(row);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRow = async (row) => {
    const ok = confirm(`Hapus data ini?`);
    if (!ok) return;

    await api(`${config.endpoint}/${row.id}`, {
      method: "DELETE",
    });

    setMessage("Data berhasil dihapus.");
    await loadRows();
  };

  const renderField = (field) => {
    const value = form[field.name] ?? "";

    if (field.type === "textarea") {
      return (
        <textarea
          required={field.required}
          value={value}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        />
      );
    }

    if (field.type === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) =>
            setForm({ ...form, [field.name]: e.target.checked })
          }
        />
      );
    }

    if (field.type === "select") {
      const options = field.options || [];
      const loaded = fieldOptions[field.optionsUrl] || [];
      const allOptions =
        options.length > 0
          ? options
          : loaded.map((item) => [item.id, item.name]);

      return (
        <select
          required={field.required}
          value={value}
          onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
        >
          <option value="">{field.required ? "Pilih..." : "Semua"}</option>
          {allOptions.map((opt) => (
            <option key={opt[0]} value={opt[0]}>
              {opt[1]}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type || "text"}
        required={field.required}
        value={value}
        onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
      />
    );
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Master Data</p>
          <h1>{config.title}</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>{editing ? "Edit Data" : "Tambah Data"}</h2>

          <div className="admin-form-grid">
            {fields.map((field) => (
              <label
                key={field.name}
                className={
                  field.type === "textarea" || field.type === "select"
                    ? "wide"
                    : ""
                }
              >
                <span>{field.label}</span>
                {renderField(field)}
              </label>
            ))}
          </div>

          <div className="admin-actions">
            <button type="submit">{editing ? "Update" : "Simpan"}</button>
            {editing && (
              <button type="button" className="secondary" onClick={resetForm}>
                Batal Edit
              </button>
            )}
          </div>

          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-table-header">
          <h2>Data</h2>
          {loading && <span>Memuat...</span>}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                {config.columns.map((column) => (
                  <th key={column}>{column.replaceAll("_", " ")}</th>
                ))}
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 2}>Belum ada data.</td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>

                    {config.columns.map((column) => (
                      <td key={column}>
                        {typeof row[column] === "boolean"
                          ? boolLabel(row[column])
                          : String(row[column] ?? "-")}
                      </td>
                    ))}

                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => editRow(row)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => deleteRow(row)}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

function IndicatorBadge({ status }) {
  if (!status) return null;
  const label = ({ aman: "Aman", waspada: "Waspada", intervensi: "Intervensi", belum_dikaji: "Belum Dikaji" }[status]) || status;
  return <span className={`indicator ${status}`}>{label}</span>;
}

function PriceMonitoring() {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const [filters, setFilters] = useState({ markets: [], commodities: [] });
  const [marketId, setMarketId] = useState("");
  const [commodityId, setCommodityId] = useState("");
  const [startDate, setStartDate] = useState(iso(weekAgo));
  const [endDate, setEndDate] = useState(iso(today));
  const [rows, setRows] = useState([]);
  const [chart, setChart] = useState([]);
  const [adminAverages, setAdminAverages] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/market/filters")
      .then((r) => r.json())
      .then((d) => setFilters(d.data || { markets: [], commodities: [] }));
  }, []);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (marketId) q.set("market_id", marketId);
    if (commodityId) q.set("commodity_id", commodityId);
    if (startDate) q.set("start_date", startDate);
    if (endDate) q.set("end_date", endDate);
    q.set("internal", "1");
    return q.toString();
  }, [marketId, commodityId, startDate, endDate]);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch(`/api/market/summary?${query}`).then((r) => r.json()),
      fetch(`/api/market/chart?${query}`).then((r) => r.json()),
      fetch(`/api/market/admin-averages?${query}`).then((r) => r.json()),
    ])
      .then(([summary, chartData, avg]) => {
        setRows(summary?.data?.rows || []);
        setChart(chartData?.data || []);
        setAdminAverages(avg?.data || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  const maxChart = Math.max(...chart.map((item) => Number(item.average_price) || 0), 1);

  return (
    <div>
      <div className="admin-header">
        <div>
          <p>Admin</p>
          <h1>Pemantauan Harga Komoditas</h1>
        </div>
        <a className="btn" href={`/api/admin/prices/export?${query}`}>Download Excel</a>
      </div>

      <div className="filterPanel" style={{ background: "#fff", border: "1px solid #d0d5dd", borderRadius: 12, padding: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 22 }}>
        <label style={{ display: "grid", gap: 6, fontWeight: 600, color: "#344054", fontSize: 13 }}>
          Pasar
          <select value={marketId} onChange={(e) => setMarketId(e.target.value)} style={{ border: "1px solid #d0d5dd", borderRadius: 10, padding: "10px 12px", font: "inherit", background: "#fff" }}>
            <option value="">Semua Pasar</option>
            {filters.markets.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </label>
        <label style={{ display: "grid", gap: 6, fontWeight: 600, color: "#344054", fontSize: 13 }}>
          Dari Tanggal
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: "1px solid #d0d5dd", borderRadius: 10, padding: "10px 12px", font: "inherit" }} />
        </label>
        <label style={{ display: "grid", gap: 6, fontWeight: 600, color: "#344054", fontSize: 13 }}>
          Sampai Tanggal
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: "1px solid #d0d5dd", borderRadius: 10, padding: "10px 12px", font: "inherit" }} />
        </label>
        <label style={{ display: "grid", gap: 6, fontWeight: 600, color: "#344054", fontSize: 13 }}>
          Komoditas
          <select value={commodityId} onChange={(e) => setCommodityId(e.target.value)} style={{ border: "1px solid #d0d5dd", borderRadius: 10, padding: "10px 12px", font: "inherit", background: "#fff" }}>
            <option value="">Semua</option>
            {filters.commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
      </div>

      <div className="admin-card">
        <h2>Tabel Harga Komoditas</h2>
        {loading && <p>Memuat data...</p>}
        {!loading && rows.length === 0 && <p>Belum ada data.</p>}
        {!loading && rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Komoditas</th>
                  <th>Rata-rata</th>
                  <th>Sebelumnya</th>
                  <th>Selisih</th>
                  <th>Pasar</th>
                  <th>HET</th>
                  <th>HAP</th>
                  <th>Indikator</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.commodity_id}>
                    <td>{i + 1}</td>
                    <td>{r.nama_komoditas}</td>
                    <td>{rupiah(r.average_price)}</td>
                    <td>{rupiah(r.previous_average_price)}</td>
                    <td style={{ color: r.tren === "naik" ? "#dc2626" : r.tren === "turun" ? "#16a34a" : "#64748b" }}>{rupiah(Math.abs(r.selisih))}</td>
                    <td>{r.market_count}</td>
                    <td>{r.het_price ? rupiah(r.het_price) : "-"}</td>
                    <td>{r.hap_price ? rupiah(r.hap_price) : "-"}</td>
                    <td><IndicatorBadge status={r.indicator_status} /></td>
                    <td>{r.latest_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2>Ringkasan Rata-rata</h2>
        {adminAverages && (
          <div className="avgGrid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 12 }}>
            {Object.entries(adminAverages).map(([period, data]) => (
              <div key={period} style={{ background: "#f9fafb", borderRadius: 12, padding: 16 }}>
                <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "#0f2d52" }}>
                  {period === "weekly" ? "Mingguan" : period === "monthly" ? "Bulanan" : "Tahunan"}
                </h3>
                {data.slice(0, 10).map((row) => (
                  <p key={`${period}-${row.id}`} style={{ margin: "4px 0", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <strong>{row.name}</strong> <span>{rupiah(row.average_price)}</span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2>Grafik Harga</h2>
        <div className="chartBox" style={{ background: "#fff", border: "1px solid #eaecf0", borderRadius: 12, padding: 16 }}>
          {chart.length === 0 && <p>Belum ada data grafik.</p>}
          {chart.map((item, index) => (
            <div key={`${item.price_date}-${item.commodity_name}-${index}`} className="barRow" style={{ display: "grid", gridTemplateColumns: "minmax(140px,1.2fr) minmax(100px,2fr) minmax(90px,0.8fr)", gap: 10, alignItems: "center", fontSize: 12, marginBottom: 6 }}>
              <span>{item.price_date} · {item.commodity_name}</span>
              <div style={{ height: 12, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
                <i style={{ display: "block", height: "100%", width: `${Math.max(6, (Number(item.average_price) / maxChart) * 100)}%`, background: "linear-gradient(90deg,#0f2d52,#2563eb)", borderRadius: 999 }} />
              </div>
              <strong>{rupiah(item.average_price)}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminApp() {
  const activeKey = getActiveKey();
  const config = resources[activeKey];

  return (
    <AdminLayout>
      {activeKey === "dashboard" ? (
        <Dashboard />
      ) : activeKey === "prices-monitor" ? (
        <PriceMonitoring />
      ) : config ? (
        <CrudPage config={config} />
      ) : (
        <Dashboard />
      )}
    </AdminLayout>
  );
}

createRoot(document.getElementById("admin-root")).render(<AdminApp />);
