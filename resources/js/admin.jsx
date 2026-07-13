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
      { name: "category", label: "Kategori", type: "select", options: [["Pasar Rakyat", "Pasar Rakyat"], ["Pasar Modern", "Pasar Modern"], ["Minimarket", "Minimarket"], ["Pusat Perbelanjaan", "Pusat Perbelanjaan"]] },
      { name: "address", label: "Alamat", type: "textarea" },
      { name: "image", label: "Gambar", type: "file" },
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
      { name: "image", label: "Gambar", type: "file" },
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
      { name: "image", label: "Gambar", type: "file" },
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
      { name: "category", label: "Kategori", type: "select", required: true, options: [["laporan", "laporan"], ["layanan", "layanan"], ["renja", "renja"], ["renstra", "renstra"]] },
      { name: "file_path", label: "File", type: "file", accept: ".pdf,.doc,.docx,.xls,.xlsx", required: true },
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
  prices: {
    title: "Input Harga Komoditas",
    endpoint: "/api/admin/prices",
    fields: [
      { name: "pasar_id", label: "Pasar", type: "select", required: true, optionsUrl: "/api/admin/markets" },
      { name: "komoditas_id", label: "Komoditas", type: "select", required: true, optionsUrl: "/api/admin/commodities" },
      { name: "price_date", label: "Tanggal", type: "date", required: true },
      { name: "price", label: "Harga", type: "number", required: true },
    ],
    columns: ["pasar_name", "komoditas_name", "price_date", "price"],
    defaults: {
      pasar_id: "",
      komoditas_id: "",
      price_date: new Date().toISOString().slice(0, 10),
      price: "",
    },
  },
  "het-hap": {
    title: "HET / HAP",
    endpoint: "/api/admin/het-hap",
    fields: [
      { name: "komoditas_id", label: "Komoditas", type: "select", required: true, optionsUrl: "/api/admin/commodities" },
      { name: "pasar_id", label: "Pasar (Opsional)", type: "select", optionsUrl: "/api/admin/markets" },
      { name: "price", label: "Harga", type: "number", required: true },
      { name: "effective_date", label: "Tanggal Berlaku", type: "date" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
      { name: "notes", label: "Catatan", type: "textarea" },
    ],
    columns: ["komoditas_name", "pasar_name", "price", "effective_date", "is_active"],
    defaults: {
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
      { name: "image", label: "Gambar", type: "file", required: true },
      { name: "link_url", label: "Link URL" },
      { name: "sort_order", label: "Urutan", type: "number" },
      { name: "is_active", label: "Aktif", type: "checkbox" },
    ],
    columns: ["title", "image", "is_active"],
    defaults: { title: "", image: "", link_url: "", sort_order: 0, is_active: true },
  },
  users: {
    title: "Manajemen User",
    endpoint: "/api/admin/users",
    fields: [
      { name: "name", label: "Nama", required: true },
      { name: "username", label: "Username", required: true },
      { name: "email", label: "Email" },
      { name: "password", label: "Password", type: "password" },
      { name: "user_role", label: "Role", type: "select", required: true, options: [["admin", "Admin"], ["surveyor", "Surveyor Pasar"]] },
    ],
    columns: ["name", "username", "email", "user_role"],
    defaults: {
      name: "",
      username: "",
      email: "",
      password: "",
      user_role: "surveyor",
    },
  },
  "survey-settings": {
    title: "Master Survey / SKM",
    endpoint: "/api/admin/survey-settings",
    fields: [
      { name: "title", label: "Judul", required: true },
      { name: "external_url", label: "Link Survey" },
      { name: "qr_image", label: "QR Image", type: "file" },
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

const allMenus = [
  { key: "dashboard", label: "Dashboard", href: "/admin", roles: ["admin", "surveyor"] },
  { key: "prices", label: "Input Harga", href: "/admin/prices", roles: ["admin", "surveyor"] },
  { key: "prices-monitor", label: "Pemantauan Harga", href: "/admin/prices-monitor", roles: ["admin", "surveyor"] },
  { key: "markets", label: "Master Pasar", href: "/admin/markets", roles: ["admin"] },
  { key: "commodities", label: "Master Komoditas", href: "/admin/commodities", roles: ["admin"] },
  { key: "pages", label: "Master Halaman", href: "/admin/pages", roles: ["admin"] },
  { key: "tentang", label: "Halaman Tentang", href: "/admin/tentang", roles: ["admin"] },
  { key: "program-kegiatan", label: "Program Kegiatan", href: "/admin/program-kegiatan", roles: ["admin"] },
  { key: "ikm", label: "Data IKM", href: "/admin/ikm", roles: ["admin"] },
  { key: "downloads", label: "Master Dokumen", href: "/admin/downloads", roles: ["admin"] },
  { key: "banners", label: "Banner Slider", href: "/admin/banners", roles: ["admin"] },
  {
    key: "het-hap",
    label: "HET / HAP",
    href: "/admin/het-hap",
    roles: ["admin"],
  },
  {
    key: "survey-settings",
    label: "Master Survey",
    href: "/admin/survey-settings",
    roles: ["admin"],
  },
  {
    key: "users",
    label: "Manajemen User",
    href: "/admin/users",
    roles: ["admin"],
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

function AdminLayout({ children, menus }) {
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
  const [uploading, setUploading] = useState({});
  const [fieldOptions, setFieldOptions] = useState({});
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

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
    setShowForm(false);
    await loadRows();
  };

  const openForm = (row) => {
    if (row) {
      const next = { ...config.defaults };
      fields.forEach((field) => {
        next[field.name] = row[field.name] ?? config.defaults[field.name] ?? "";
      });
      setForm(next);
      setEditing(row);
    } else {
      resetForm();
    }
    setShowForm(true);
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

  const uploadFile = async (fieldName, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [fieldName]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf },
        credentials: "same-origin",
        body,
      });
      const data = await result.json();
      if (data?.data?.path) {
        setForm((prev) => ({ ...prev, [fieldName]: data.data.path }));
      }
    } catch {
      /* ignore */
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
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

    if (field.type === "file") {
      const isImage = value && /\.(png|jpe?g|gif|webp|svg)$/i.test(value);
      return (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="file"
              accept={field.accept || "image/*,.pdf"}
              onChange={(e) => uploadFile(field.name, e.target.files[0])}
            />
            {uploading[field.name] && <span>Uploading...</span>}
          </div>
          {value && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#344054" }}>
              <span>{value}</span>
              {isImage && (
                <img
                  src={`/assets/${value}`}
                  alt="preview"
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #d0d5dd" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </div>
          )}
        </div>
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

  const filtered = useMemo(() => {
    let data = rows;
    if (search) {
      const q = search.toLowerCase();
      data = rows.filter((row) =>
        config.columns.some((col) => {
          const v = row[col];
          return v != null && String(v).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey && sortDir) {
      data = [...data].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, search, sortKey, sortDir]);

  const toggleSort = (col) => {
    if (sortKey === col) {
      if (sortDir === "asc") { setSortDir("desc"); }
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
      else { setSortDir("asc"); setSortKey(col); }
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Master Data</p>
          <h1>{config.title}</h1>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-header">
          <h2>Data</h2>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {loading && <span>Memuat...</span>}
            <button className="btn" onClick={() => openForm(null)}>+ Tambah</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={submit} className="admin-form" style={{ marginBottom: 20, paddingTop: 16, borderTop: "1px solid #eaecf0" }}>
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
              <button type="button" className="secondary" onClick={() => { resetForm(); setShowForm(false); }}>
                Batal
              </button>
            </div>

            {message && <p className="admin-message">{message}</p>}
          </form>
        )}

        <div className="tableToolbar">
          <input
            className="searchInput"
            type="text"
            placeholder="Cari data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="recordCount">{filtered.length} / {rows.length} data</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                {config.columns.map((column) => (
                  <th
                    key={column}
                    className={sortKey === column ? sortDir : ""}
                    onClick={() => toggleSort(column)}
                  >
                    {column.replaceAll("_", " ")}
                    <span className="sortIcon">{sortKey === column ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span>
                  </th>
                ))}
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 2}>Belum ada data.</td>
                </tr>
              ) : (
                paginated.map((row, index) => (
                  <tr key={row.id}>
                    <td>{(safePage - 1) * perPage + index + 1}</td>

                    {config.columns.map((column) => (
                      <td key={column}>
                        {typeof row[column] === "boolean"
                          ? boolLabel(row[column])
                          : String(row[column] ?? "-")}
                      </td>
                    ))}

                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => openForm(row)}>
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

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={safePage === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next ›</button>
          </div>
        )}
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
  const [chart, setChart] = useState({ dates: [], series: [] });
  const [adminAverages, setAdminAverages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

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
        setChart(chartData?.data || { dates: [], series: [] });
        setAdminAverages(avg?.data || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [query]);

  const filteredRows = useMemo(() => {
    let data = rows;
    if (search) {
      const q = search.toLowerCase();
      data = rows.filter((r) =>
        [r.nama_komoditas, r.average_price, r.previous_average_price, r.indicator_status, r.latest_date]
          .some((v) => v != null && String(v).toLowerCase().includes(q))
      );
    }
    if (sortKey && sortDir) {
      data = [...data].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        if (va == null) return 1;
        if (vb == null) return -1;
        const cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, search, sortKey, sortDir]);

  const toggleSort = (col) => {
    if (sortKey === col) {
      if (sortDir === "asc") { setSortDir("desc"); }
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
      else { setSortDir("asc"); setSortKey(col); }
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filteredRows.slice((safePage - 1) * perPage, safePage * perPage);

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

        <div className="tableToolbar">
          <input className="searchInput" type="text" placeholder="Cari komoditas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="recordCount">{filteredRows.length} / {rows.length} data</span>
        </div>

        {loading && <p>Memuat data...</p>}
        {!loading && paginated.length === 0 && <p>Belum ada data.</p>}
        {!loading && paginated.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th className={sortKey === "nama_komoditas" ? sortDir : ""} onClick={() => toggleSort("nama_komoditas")}>Komoditas <span className="sortIcon">{sortKey === "nama_komoditas" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span></th>
                  <th className={sortKey === "average_price" ? sortDir : ""} onClick={() => toggleSort("average_price")}>Rata-rata <span className="sortIcon">{sortKey === "average_price" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span></th>
                  <th>Sebelumnya</th>
                  <th>Selisih</th>
                  <th className={sortKey === "market_count" ? sortDir : ""} onClick={() => toggleSort("market_count")}>Pasar <span className="sortIcon">{sortKey === "market_count" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span></th>
                  <th>Harga Acuan</th>
                  <th className={sortKey === "indicator_status" ? sortDir : ""} onClick={() => toggleSort("indicator_status")}>Indikator <span className="sortIcon">{sortKey === "indicator_status" ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}</span></th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r, i) => (
                  <tr key={r.commodity_id}>
                    <td>{(safePage - 1) * perPage + i + 1}</td>
                    <td>{r.nama_komoditas}</td>
                    <td>{rupiah(r.average_price)}</td>
                    <td>{rupiah(r.previous_average_price)}</td>
                    <td style={{ color: r.tren === "naik" ? "#dc2626" : r.tren === "turun" ? "#16a34a" : "#64748b" }}>{rupiah(Math.abs(r.selisih))}</td>
                    <td>{r.market_count}</td>
                    <td>{r.reference_price ? rupiah(r.reference_price) : "-"}</td>
                    <td><IndicatorBadge status={r.indicator_status} /></td>
                    <td>{r.latest_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹ Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={safePage === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
            ))}
            <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next ›</button>
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
          {(!chart.dates || chart.dates.length === 0) && <p>Belum ada data grafik.</p>}
          {chart.dates && chart.dates.length > 0 && chart.series && chart.series.map((s) => {
            const maxVal = Math.max(...s.data.filter(v => v !== null), 1);
            return (
              <div key={s.commodity_id} style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 13, color: "#0f2d52", display: "block", marginBottom: 6 }}>{s.name}</strong>
                {chart.dates.map((d, i) => {
                  const val = s.data[i];
                  if (val === null) return null;
                  return (
                    <div key={d} className="barRow" style={{ display: "grid", gridTemplateColumns: "minmax(100px,1fr) minmax(80px,1.8fr) minmax(80px,0.7fr)", gap: 8, alignItems: "center", fontSize: 11, marginBottom: 3 }}>
                      <span>{d}</span>
                      <div style={{ height: 10, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
                        <i style={{ display: "block", height: "100%", width: `${Math.max(4, (val / maxVal) * 100)}%`, background: "linear-gradient(90deg,#0f2d52,#2563eb)", borderRadius: 999 }} />
                      </div>
                      <strong>{rupiah(val)}</strong>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProgramKegiatanAdmin() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    eyebrow: "",
    program_data: {
      intro: "",
      programs: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const result = await api("/api/admin/program-kegiatan");
      const d = result.data || {};
      setData(d);
      setForm({
        title: d.title || "",
        eyebrow: d.eyebrow || "",
        program_data: d.program_data || { intro: "", programs: [] },
      });
    } catch {
      setMessage("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateProgram = (index, field, value) => {
    setForm((prev) => {
      const programs = [...(prev.program_data.programs || [])];
      programs[index] = { ...(programs[index] || {}), [field]: value };
      return { ...prev, program_data: { ...prev.program_data, programs } };
    });
  };

  const addProgram = () => {
    setForm((prev) => {
      const programs = [...(prev.program_data.programs || [])];
      const nextNum = programs.length > 0 ? Math.max(...programs.map((p) => p.number || 0)) + 1 : 1;
      programs.push({ number: nextNum, title: "", desc: "" });
      return { ...prev, program_data: { ...prev.program_data, programs } };
    });
  };

  const removeProgram = (index) => {
    setForm((prev) => {
      const programs = [...(prev.program_data.programs || [])];
      programs.splice(index, 1);
      return { ...prev, program_data: { ...prev.program_data, programs } };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api("/api/admin/program-kegiatan", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          eyebrow: form.eyebrow,
          program_data: form.program_data,
        }),
      });
      setMessage("Data berhasil disimpan.");
    } catch (err) {
      setMessage("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman Program Kegiatan</h1></div></div>
        <div className="admin-card"><p>Memuat data...</p></div>
      </>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Pengaturan</p>
          <h1>Halaman Program Kegiatan</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>

          <h2 style={{ marginTop: 28 }}>Teks Intro</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Teks Pengantar</span><textarea value={form.program_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, program_data: { ...p.program_data, intro: e.target.value } }))} /></label>
          </div>

          <h2 style={{ marginTop: 28 }}>Daftar Program</h2>
          {(form.program_data.programs || []).map((prog, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => removeProgram(i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label><span>Nomor</span><input type="number" value={prog.number || ""} onChange={(e) => updateProgram(i, "number", Number(e.target.value))} /></label>
              <label><span>Judul Program</span><input value={prog.title || ""} onChange={(e) => updateProgram(i, "title", e.target.value)} /></label>
              <label className="wide"><span>Deskripsi</span><textarea value={prog.desc || ""} onChange={(e) => updateProgram(i, "desc", e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={addProgram} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467" }}>
            + Tambah Program
          </button>

          <div className="admin-actions" style={{ marginTop: 28 }}>
            <button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>

          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    </>
  );
}

function IkmAdmin() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", category: "fashion", owner: "", description: "", address: "", kelurahan: "", contact: "", location: "", image: "", is_active: true, sort_order: 0 });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const categoryOptions = [
    { value: "fashion", label: "Fashion" },
    { value: "kerajinan", label: "Kerajinan" },
    { value: "makanan_minuman", label: "Makanan & Minuman" },
    { value: "lainnya", label: "Lainnya" },
  ];

  const load = async () => {
    setLoading(true);
    try {
      const res = await api("/api/admin/ikm");
      setItems(res.data || []);
    } catch {
      setMessage("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ name: "", category: "fashion", owner: "", description: "", address: "", kelurahan: "", contact: "", location: "", image: "", is_active: true, sort_order: 0 });
    setEditing(null);
  };

  const edit = (item) => {
    setForm({ ...item });
    setEditing(item.id);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      if (editing) {
        await api(`/api/admin/ikm/${editing}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setMessage("Data berhasil diperbarui.");
      } else {
        await api("/api/admin/ikm", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setMessage("Data berhasil ditambahkan.");
      }
      resetForm();
      await load();
    } catch (err) {
      setMessage("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Hapus data IKM ini?")) return;
    try {
      await api(`/api/admin/ikm/${id}`, { method: "DELETE" });
      await load();
    } catch {
      setMessage("Gagal menghapus data.");
    }
  };

  if (loading) {
    return (
      <>
        <div className="admin-header"><div><p>Pengaturan</p><h1>Data IKM</h1></div></div>
        <div className="admin-card"><p>Memuat data...</p></div>
      </>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Pengaturan</p>
          <h1>Data IKM</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>{editing ? "Edit IKM" : "Tambah IKM Baru"}</h2>
          <div className="admin-form-grid">
            <label><span>Nama Usaha *</span><input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required /></label>
            <label><span>Kategori *</span>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label><span>Pemilik</span><input value={form.owner || ""} onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))} /></label>
            <label><span>No. HP</span><input value={form.contact || ""} onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))} /></label>
            <label><span>Kelurahan</span><input value={form.kelurahan || ""} onChange={(e) => setForm((p) => ({ ...p, kelurahan: e.target.value }))} /></label>
            <label className="wide"><span>Alamat</span><input value={form.address || ""} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></label>
            <label className="wide"><span>Lokasi (Link Maps)</span><input value={form.location || ""} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></label>
            <label><span>Gambar</span><input value={form.image || ""} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))} /></label>
            <label><span>Urutan</span><input type="number" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} /></label>
            <label className="checkbox">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
              <span>Aktif</span>
            </label>
          </div>
          <div className="admin-actions" style={{ marginTop: 16 }}>
            <button type="submit" disabled={saving}>{saving ? "Menyimpan..." : editing ? "Perbarui" : "Tambah"}</button>
            {editing && <button type="button" onClick={resetForm} style={{ background: "#eaecf0", color: "#344054" }}>Batal</button>}
          </div>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>

      <div className="admin-card" style={{ marginTop: 20 }}>
        <h2>Daftar IKM ({items.length})</h2>
        <div className="admin-table-wrap" style={{ marginTop: 12 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Alamat</th>
                <th>Kelurahan</th>
                <th>No. HP</th>
                <th>Aktif</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.name}</td>
                  <td>{categoryOptions.find((o) => o.value === item.category)?.label || item.category}</td>
                  <td style={{ maxWidth: 220, whiteSpace: "normal", lineHeight: 1.3 }}>{item.address || "-"}</td>
                  <td>{item.kelurahan || "-"}</td>
                  <td>{item.contact || "-"}</td>
                  <td>{item.is_active ? "Ya" : "Tidak"}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => edit(item)}>Edit</button>
                      <button className="danger" onClick={() => remove(item.id)}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 24, color: "#667085" }}>Belum ada data IKM.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function TentangAdmin() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    eyebrow: "",
    tentang_data: {
      logo: "",
      kadin: { photo: "", name: "", title: "", description: "" },
      bidang: [],
      alamat: [],
      kontak: [],
      maps_embed: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const result = await api("/api/admin/tentang");
      const d = result.data || {};
      setData(d);
      setForm({
        title: d.title || "",
        eyebrow: d.eyebrow || "",
        tentang_data: d.tentang_data || {
          logo: "",
          kadin: { photo: "", name: "", title: "", description: "" },
          bidang: [],
          alamat: [],
          kontak: [],
          maps_embed: "",
        },
      });
    } catch {
      setMessage("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (fieldName, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [fieldName]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf },
        credentials: "same-origin",
        body,
      });
      const res = await result.json();
      if (res?.data?.path) {
        const path = res.data.path;
        const parts = fieldName.split(".");
        if (parts.length === 1) {
          setForm((prev) => ({ ...prev, [parts[0]]: path }));
        } else if (parts.length === 2) {
          setForm((prev) => ({
            ...prev,
            tentang_data: {
              ...prev.tentang_data,
              [parts[1]]: path,
            },
          }));
        } else if (parts.length === 3) {
          setForm((prev) => ({
            ...prev,
            tentang_data: {
              ...prev.tentang_data,
              [parts[0]]: {
                ...(prev.tentang_data[parts[0]] || {}),
                [parts[1]]: path,
              },
            },
          }));
        }
      }
    } catch {
      /* ignore */
    } finally {
      setUploading((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const updateTentangData = (path, value) => {
    const parts = path.split(".");
    if (parts.length === 1) {
      setForm((prev) => ({
        ...prev,
        tentang_data: { ...prev.tentang_data, [parts[0]]: value },
      }));
    } else if (parts.length === 2) {
      setForm((prev) => ({
        ...prev,
        tentang_data: {
          ...prev.tentang_data,
          [parts[0]]: {
            ...(prev.tentang_data[parts[0]] || {}),
            [parts[1]]: value,
          },
        },
      }));
    } else if (parts.length === 3) {
      setForm((prev) => {
        const arr = [...(prev.tentang_data[parts[0]] || [])];
        arr[Number(parts[1])] = {
          ...(arr[Number(parts[1])] || {}),
          [parts[2]]: value,
        };
        return { ...prev, tentang_data: { ...prev.tentang_data, [parts[0]]: arr } };
      });
    }
  };

  const addArrayItem = (key) => {
    setForm((prev) => {
      const arr = [...(prev.tentang_data[key] || [])];
      if (key === "bidang") arr.push({ title: "", desc: "" });
      else if (key === "alamat") arr.push({ title: "", address: "" });
      else if (key === "kontak") arr.push({ label: "", value: "", href: "", icon: "" });
      return { ...prev, tentang_data: { ...prev.tentang_data, [key]: arr } };
    });
  };

  const removeArrayItem = (key, index) => {
    setForm((prev) => {
      const arr = [...(prev.tentang_data[key] || [])];
      arr.splice(index, 1);
      return { ...prev, tentang_data: { ...prev.tentang_data, [key]: arr } };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api("/api/admin/tentang", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          eyebrow: form.eyebrow,
          tentang_data: form.tentang_data,
        }),
      });
      setMessage("Data berhasil disimpan.");
    } catch (err) {
      setMessage("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const fileInput = (fieldName, label) => {
    const value = fieldName === "logo"
      ? form.tentang_data.logo
      : fieldName === "kadin.photo"
        ? form.tentang_data.kadin?.photo || ""
        : "";
    const isImage = value && /\.(png|jpe?g|gif|webp|svg)$/i.test(value);

    return (
      <label>
        <span>{label}</span>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadFile(fieldName, e.target.files[0])}
            />
            {uploading[fieldName] && <span>Uploading...</span>}
          </div>
          {value && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#344054" }}>
              <span>{value}</span>
              {isImage && (
                <img
                  src={`/assets/${value}`}
                  alt="preview"
                  style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, border: "1px solid #d0d5dd" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
            </div>
          )}
        </div>
      </label>
    );
  };

  const topFields = ["title", "eyebrow"];

  const getValue = (fieldPath) => {
    if (topFields.includes(fieldPath)) return form[fieldPath] ?? "";
    const parts = fieldPath.split(".");
    let obj = form.tentang_data;
    for (const part of parts) {
      if (obj == null) return "";
      obj = obj[part];
    }
    return obj ?? "";
  };

  const setValue = (fieldPath, value) => {
    if (topFields.includes(fieldPath)) {
      setForm((p) => ({ ...p, [fieldPath]: value }));
      return;
    }
    updateTentangData(fieldPath, value);
  };

  const textInput = (fieldPath, label, type = "text") => {
    const value = getValue(fieldPath);
    return (
      <label>
        <span>{label}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(fieldPath, e.target.value)}
        />
      </label>
    );
  };

  const textareaInput = (fieldPath, label) => {
    const value = getValue(fieldPath);

    return (
      <label className="wide">
        <span>{label}</span>
        <textarea
          value={value}
          onChange={(e) => setValue(fieldPath, e.target.value)}
        />
      </label>
    );
  };

  if (loading) {
    return (
      <>
        <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman Tentang</h1></div></div>
        <div className="admin-card"><p>Memuat data...</p></div>
      </>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Pengaturan</p>
          <h1>Halaman Tentang</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            {textInput("title", "Judul Hero")}
            {textInput("eyebrow", "Subtitle (Eyebrow)")}
          </div>

          <h2 style={{ marginTop: 28 }}>Logo</h2>
          <div className="admin-form-grid">
            {fileInput("logo", "Logo DISPERDAGIN")}
          </div>

          <h2 style={{ marginTop: 28 }}>Kepala Dinas</h2>
          <div className="admin-form-grid">
            {fileInput("kadin.photo", "Foto Kepala Dinas")}
            {textInput("kadin.name", "Nama Kepala Dinas")}
            {textInput("kadin.title", "Jabatan")}
            {textareaInput("kadin.description", "Deskripsi Profil")}
          </div>

          <h2 style={{ marginTop: 28 }}>Bidang</h2>
          {(form.tentang_data.bidang || []).map((item, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => removeArrayItem("bidang", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label><span>Nama Bidang</span><input value={item.title || ""} onChange={(e) => updateTentangData(`bidang.${i}.title`, e.target.value)} /></label>
              <label className="wide"><span>Deskripsi</span><textarea value={item.desc || ""} onChange={(e) => updateTentangData(`bidang.${i}.desc`, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("bidang")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467" }}>
            + Tambah Bidang
          </button>

          <h2 style={{ marginTop: 28 }}>Alamat</h2>
          {(form.tentang_data.alamat || []).map((item, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => removeArrayItem("alamat", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label><span>Nama Tempat</span><input value={item.title || ""} onChange={(e) => updateTentangData(`alamat.${i}.title`, e.target.value)} /></label>
              <label className="wide"><span>Alamat</span><textarea value={item.address || ""} onChange={(e) => updateTentangData(`alamat.${i}.address`, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("alamat")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467" }}>
            + Tambah Alamat
          </button>

          <h2 style={{ marginTop: 28 }}>Kontak</h2>
          {(form.tentang_data.kontak || []).map((item, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => removeArrayItem("kontak", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label><span>Label</span><input value={item.label || ""} onChange={(e) => updateTentangData(`kontak.${i}.label`, e.target.value)} /></label>
              <label><span>Nilai</span><input value={item.value || ""} onChange={(e) => updateTentangData(`kontak.${i}.value`, e.target.value)} /></label>
              <label className="wide"><span>Link (href)</span><input value={item.href || ""} onChange={(e) => updateTentangData(`kontak.${i}.href`, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem("kontak")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467" }}>
            + Tambah Kontak
          </button>

          <h2 style={{ marginTop: 28 }}>Google Maps</h2>
          <div className="admin-form-grid">
            {textareaInput("maps_embed", "URL Embed Google Maps")}
          </div>

          <div className="admin-actions" style={{ marginTop: 28 }}>
            <button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button>
          </div>

          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    </>
  );
}

function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/api/admin/me")
      .then((d) => {
        setUser(d.data || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const activeKey = getActiveKey();

  if (loading) {
    return (
      <AdminLayout menus={[]}>
        <div className="admin-header"><h1>Memuat...</h1></div>
      </AdminLayout>
    );
  }

  const role = user?.role || "surveyor";
  const menus = allMenus.filter((m) => m.roles.includes(role));
  const allowedKeys = menus.map((m) => m.key);
  const currentMenu = allMenus.find((m) => m.key === activeKey);
  const hasAccess = currentMenu ? currentMenu.roles.includes(role) : false;

  if (!hasAccess) {
    return (
      <AdminLayout menus={menus}>
        <div className="admin-header">
          <h1>Akses Ditolak</h1>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </AdminLayout>
    );
  }

  const config = resources[activeKey];

  return (
    <AdminLayout menus={menus}>
      {activeKey === "dashboard" ? (
        <Dashboard />
      ) : activeKey === "prices-monitor" ? (
        <PriceMonitoring />
      ) : activeKey === "tentang" ? (
        <TentangAdmin />
      ) : activeKey === "program-kegiatan" ? (
        <ProgramKegiatanAdmin />
      ) : activeKey === "ikm" ? (
        <IkmAdmin />
      ) : config ? (
        <CrudPage config={config} />
      ) : (
        <Dashboard />
      )}
    </AdminLayout>
  );
}

const adminContainer = document.getElementById("admin-root");

if (adminContainer) {
  const root = window.__DISPERDAGIN_ADMIN_ROOT__ ?? createRoot(adminContainer);
  window.__DISPERDAGIN_ADMIN_ROOT__ = root;
  root.render(<AdminApp />);
}
