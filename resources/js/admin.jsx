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

const menuGroups = [
  { key: "dashboard", label: "Dashboard", href: "/admin", roles: ["admin", "surveyor"] },
  {
    label: "Master Data", roles: ["admin"],
    items: [
      { key: "markets", label: "Pasar", href: "/admin/markets" },
      { key: "commodities", label: "Komoditas", href: "/admin/commodities" },
      { key: "pages", label: "Halaman", href: "/admin/pages" },
      { key: "downloads", label: "Dokumen", href: "/admin/downloads" },
      { key: "survey-settings", label: "Survey", href: "/admin/survey-settings" },
    ],
  },
  {
    label: "Harga", roles: ["admin", "surveyor"],
    items: [
      { key: "prices", label: "Input Harga", href: "/admin/prices" },
      { key: "prices-monitor", label: "Pemantauan Harga", href: "/admin/prices-monitor" },
    ],
    extra: [
      { key: "het-hap", label: "HET / HAP", href: "/admin/het-hap", roles: ["admin"] },
    ],
  },
  {
    label: "Konten", roles: ["admin"],
    items: [
      { key: "tentang", label: "Halaman Tentang", href: "/admin/tentang" },
      { key: "program-kegiatan", label: "Program Kegiatan", href: "/admin/program-kegiatan" },
      { key: "banners", label: "Banner Slider", href: "/admin/banners" },
      { key: "ikm", label: "Data IKM", href: "/admin/ikm" },
      { key: "zona-integritas", label: "Zona Integritas", href: "/admin/zona-integritas" },
    ],
  },
  {
    label: "Layanan", roles: ["admin"],
    items: [
      { key: "layanan-halal", label: "Sertifikasi Halal", href: "/admin/layanan-halal" },
      { key: "layanan-merk", label: "Legalitas Merk", href: "/admin/layanan-merk" },
      { key: "layanan-sinas", label: "SIINas", href: "/admin/layanan-sinas" },
      { key: "layanan-tera", label: "Tera / Tera Ulang", href: "/admin/layanan-tera" },
      { key: "layanan-tdg", label: "Tanda Daftar Gudang", href: "/admin/layanan-tdg" },
      { key: "layanan-minhol", label: "Perpanjangan Minuman Beralkohol", href: "/admin/layanan-minhol" },
    ],
  },
  { key: "users", label: "Manajemen User", href: "/admin/users", roles: ["admin"] },
];

const allMenus = [];
menuGroups.forEach((g) => {
  if (g.items) { g.items.forEach((i) => { allMenus.push({ ...i, roles: g.roles }); }); }
  if (g.extra) { g.extra.forEach((i) => { allMenus.push(i); }); }
  if (!g.items && !g.extra) { allMenus.push({ key: g.key, label: g.label, href: g.href, roles: g.roles }); }
});

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

function AdminLayout({ children, menus, groups }) {
  const activeKey = getActiveKey();
  const [expanded, setExpanded] = useState({});

  const toggle = (label) => setExpanded((p) => ({ ...p, [label]: !p[label] }));

  const flatKeys = {};
  menus.forEach((m) => { flatKeys[m.key] = true; });

  const isGroupVisible = (g) => {
    if (g.key) return flatKeys[g.key];
    if (g.extra) return (g.items || []).some((i) => flatKeys[i.key]) || g.extra.some((i) => flatKeys[i.key]);
    return (g.items || []).some((i) => flatKeys[i.key]);
  };

  const hasItemInGroup = (g) => (g.items || []).some((i) => flatKeys[i.key]);

  const renderItem = (item) => (
    <a key={item.key} href={item.href} className={activeKey === item.key ? "active" : ""}>{item.label}</a>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <strong>DISPERDAGIN</strong>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-menu">
          {groups.filter(isGroupVisible).map((g) => (
            g.key ? renderItem({ key: g.key, label: g.label, href: g.href }) : (
              <div key={g.label} className="admin-menuGroup">
                <button type="button" className={expanded[g.label] ? "admin-menuGroupBtn open" : "admin-menuGroupBtn"}
                  onClick={() => toggle(g.label)}>
                  <span>{g.label}</span>
                  <svg className="admin-menuArrow" width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M6 8l4 4 4-4" /></svg>
                </button>
                <div className={expanded[g.label] ? "admin-menuSub open" : "admin-menuSub"}>
                  {g.items.filter((i) => flatKeys[i.key]).map(renderItem)}
                  {hasItemInGroup(g) && g.extra && g.extra.filter((i) => flatKeys[i.key]).map(renderItem)}
                </div>
              </div>
            )
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

function LayananHalalAdmin() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    eyebrow: "",
    halal_data: {
      intro: "",
      description: "",
      requirements: [""],
      download_label: "",
      download_file: "",
      flowchart_reguler: "",
      flowchart_gratis: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf },
        credentials: "same-origin",
        body,
      });
      const result = await res.json();
      if (result?.data?.path) {
        setForm((prev) => ({
          ...prev,
          halal_data: { ...prev.halal_data, [field]: result.data.path },
        }));
      }
    } catch {
      /* ignore */
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const result = await api("/api/admin/layanan-halal");
      const d = result.data || {};
      setData(d);
      setForm({
        title: d.title || "",
        eyebrow: d.eyebrow || "",
        halal_data: d.halal_data || {
          intro: "",
          description: "",
          requirements: [""],
          download_label: "",
          download_file: "",
          flowchart_reguler: "",
          flowchart_gratis: "",
        },
      });
    } catch {
      setMessage("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateReq = (index, value) => {
    setForm((prev) => {
      const reqs = [...(prev.halal_data.requirements || [])];
      reqs[index] = value;
      return { ...prev, halal_data: { ...prev.halal_data, requirements: reqs } };
    });
  };

  const addReq = () => {
    setForm((prev) => ({
      ...prev,
      halal_data: { ...prev.halal_data, requirements: [...(prev.halal_data.requirements || []), ""] },
    }));
  };

  const removeReq = (index) => {
    setForm((prev) => {
      const reqs = [...(prev.halal_data.requirements || [])];
      reqs.splice(index, 1);
      return { ...prev, halal_data: { ...prev.halal_data, requirements: reqs } };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api("/api/admin/layanan-halal", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          eyebrow: form.eyebrow,
          halal_data: form.halal_data,
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
        <div className="admin-header"><div><p>Pengaturan</p><h1>Sertifikasi Halal</h1></div></div>
        <div className="admin-card"><p>Memuat data...</p></div>
      </>
    );
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Pengaturan</p>
          <h1>Halaman Sertifikasi Halal</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>

          <h2 style={{ marginTop: 28 }}>Konten</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Intro</span><input value={form.halal_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, halal_data: { ...p.halal_data, intro: e.target.value } }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.halal_data.description || ""} onChange={(e) => setForm((p) => ({ ...p, halal_data: { ...p.halal_data, description: e.target.value } }))} /></label>
          </div>

          <h2 style={{ marginTop: 28 }}>Persyaratan</h2>
          {(form.halal_data.requirements || []).map((req, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => removeReq(i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label className="wide"><span>Syarat {i + 1}</span><input value={req} onChange={(e) => updateReq(i, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={addReq} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467" }}>
            + Tambah Syarat
          </button>

          <h2 style={{ marginTop: 28 }}>Download & Flowchart</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Label Tombol Download</span><input value={form.halal_data.download_label || ""} onChange={(e) => setForm((p) => ({ ...p, halal_data: { ...p.halal_data, download_label: e.target.value } }))} /></label>
            <label className="wide"><span>File Download (PDF)</span>
              <div>
                <input type="file" accept=".pdf" onChange={(e) => uploadFile("download_file", e.target.files[0])} />
                {uploading.download_file && <span>Uploading...</span>}
                {form.halal_data.download_file && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.halal_data.download_file}</p>}
              </div>
            </label>
            <label className="wide"><span>Flowchart Reguler (gambar)</span>
              <div>
                <input type="file" accept="image/*" onChange={(e) => uploadFile("flowchart_reguler", e.target.files[0])} />
                {uploading.flowchart_reguler && <span>Uploading...</span>}
                {form.halal_data.flowchart_reguler && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.halal_data.flowchart_reguler}</p>}
              </div>
            </label>
            <label className="wide"><span>Flowchart Gratis / SEHATI (gambar)</span>
              <div>
                <input type="file" accept="image/*" onChange={(e) => uploadFile("flowchart_gratis", e.target.files[0])} />
                {uploading.flowchart_gratis && <span>Uploading...</span>}
                {form.halal_data.flowchart_gratis && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.halal_data.flowchart_gratis}</p>}
              </div>
            </label>
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

function LayananMerkAdmin() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    title: "",
    eyebrow: "",
    merk_data: {
      intro: "",
      description: "",
      mandiri_title: "",
      mandiri_requirements: [""],
      fasilitas_title: "",
      fasilitas_requirements: [""],
      download_label: "",
      download_file: "",
      flowchart: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf },
        credentials: "same-origin",
        body,
      });
      const result = await res.json();
      if (result?.data?.path) {
        setForm((prev) => ({
          ...prev,
          merk_data: { ...prev.merk_data, [field]: result.data.path },
        }));
      }
    } catch {
      /* ignore */
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const result = await api("/api/admin/layanan-merk");
      const d = result.data || {};
      setData(d);
      setForm({
        title: d.title || "",
        eyebrow: d.eyebrow || "",
        merk_data: d.merk_data || {
          intro: "",
          description: "",
          mandiri_title: "",
          mandiri_requirements: [""],
          fasilitas_title: "",
          fasilitas_requirements: [""],
          download_label: "",
          download_file: "",
          flowchart: "",
        },
      });
    } catch {
      setMessage("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateArr = (key, index, value) => {
    setForm((prev) => {
      const arr = [...(prev.merk_data[key] || [])];
      arr[index] = value;
      return { ...prev, merk_data: { ...prev.merk_data, [key]: arr } };
    });
  };

  const addArr = (key) => {
    setForm((prev) => ({
      ...prev,
      merk_data: { ...prev.merk_data, [key]: [...(prev.merk_data[key] || []), ""] },
    }));
  };

  const removeArr = (key, index) => {
    setForm((prev) => {
      const arr = [...(prev.merk_data[key] || [])];
      arr.splice(index, 1);
      return { ...prev, merk_data: { ...prev.merk_data, [key]: arr } };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api("/api/admin/layanan-merk", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          eyebrow: form.eyebrow,
          merk_data: form.merk_data,
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
        <div className="admin-header"><div><p>Pengaturan</p><h1>Legalitas Merk</h1></div></div>
        <div className="admin-card"><p>Memuat data...</p></div>
      </>
    );
  }

  const renderReqGroup = (title, key) => (
    <>
      <div className="admin-form-grid">
        <label className="wide"><span>Judul Grup</span><input value={form.merk_data[key + "_title"] || ""} onChange={(e) => setForm((p) => ({ ...p, merk_data: { ...p.merk_data, [key + "_title"]: e.target.value } }))} /></label>
      </div>
      <h4 style={{ margin: "12px 0 8px", fontSize: 14, color: "#344054" }}>Daftar Syarat</h4>
      {(form.merk_data[key + "_requirements"] || []).map((req, i) => (
        <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
          <button type="button" onClick={() => removeArr(key + "_requirements", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
          <label className="wide"><span>Syarat {i + 1}</span><input value={req} onChange={(e) => updateArr(key + "_requirements", i, e.target.value)} /></label>
        </div>
      ))}
      <button type="button" onClick={() => addArr(key + "_requirements")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467", marginBottom: 16 }}>
        + Tambah Syarat
      </button>
    </>
  );

  const fileUploadField = (field, label, accept) => (
    <label className="wide">
      <span>{label}</span>
      <div>
        <input type="file" accept={accept} onChange={(e) => uploadFile(field, e.target.files[0])} />
        {uploading[field] && <span>Uploading...</span>}
        {form.merk_data[field] && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.merk_data[field]}</p>}
      </div>
    </label>
  );

  return (
    <>
      <div className="admin-header">
        <div>
          <p>Pengaturan</p>
          <h1>Halaman Legalitas Merk</h1>
        </div>
      </div>

      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>

          <h2 style={{ marginTop: 28 }}>Konten</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Intro</span><input value={form.merk_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, merk_data: { ...p.merk_data, intro: e.target.value } }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.merk_data.description || ""} onChange={(e) => setForm((p) => ({ ...p, merk_data: { ...p.merk_data, description: e.target.value } }))} /></label>
          </div>

          <h2 style={{ marginTop: 28 }}>Persyaratan Mandiri</h2>
          {renderReqGroup("mandiri", "mandiri")}

          <h2 style={{ marginTop: 28 }}>Persyaratan Fasilitas Disperdagin</h2>
          {renderReqGroup("fasilitas", "fasilitas")}

          <h2 style={{ marginTop: 28 }}>Download & Flowchart</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Label Tombol Download</span><input value={form.merk_data.download_label || ""} onChange={(e) => setForm((p) => ({ ...p, merk_data: { ...p.merk_data, download_label: e.target.value } }))} /></label>
            {fileUploadField("download_file", "File Download (PDF)", ".pdf")}
            {fileUploadField("flowchart", "Flowchart (gambar)", "image/*")}
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

function LayananSinasAdmin() {
  const [form, setForm] = useState({ title: "", eyebrow: "", sinas_data: { intro: "", description: "", registrasi_title: "", registrasi_requirements: [""], dokumen_title: "", dokumen_requirements: [""], download_label: "", download_file: "", flowchart: "" } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf }, credentials: "same-origin", body });
      const r = await res.json();
      if (r?.data?.path) setForm((p) => ({ ...p, sinas_data: { ...p.sinas_data, [field]: r.data.path } }));
    } catch { /* ignore */ } finally { setUploading((p) => ({ ...p, [field]: false })); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/admin/layanan-sinas");
        const d = res.data || {};
        setForm({ title: d.title || "", eyebrow: d.eyebrow || "", sinas_data: d.sinas_data || { intro: "", description: "", registrasi_title: "", registrasi_requirements: [""], dokumen_title: "", dokumen_requirements: [""], download_label: "", download_file: "", flowchart: "" } });
      } catch { setMessage("Gagal memuat data."); } finally { setLoading(false); }
    })();
  }, []);

  const arr = (key, i, v) => setForm((p) => { const a = [...(p.sinas_data[key] || [])]; a[i] = v; return { ...p, sinas_data: { ...p.sinas_data, [key]: a } }; });
  const addArr = (key) => setForm((p) => ({ ...p, sinas_data: { ...p.sinas_data, [key]: [...(p.sinas_data[key] || []), ""] } }));
  const delArr = (key, i) => setForm((p) => { const a = [...(p.sinas_data[key] || [])]; a.splice(i, 1); return { ...p, sinas_data: { ...p.sinas_data, [key]: a } }; });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try { await api("/api/admin/layanan-sinas", { method: "POST", body: JSON.stringify({ title: form.title, eyebrow: form.eyebrow, sinas_data: form.sinas_data }) }); setMessage("Data berhasil disimpan."); } catch (err) { setMessage("Gagal: " + err.message); } finally { setSaving(false); }
  };

  if (loading) return (<><div className="admin-header"><div><p>Pengaturan</p><h1>SIINas</h1></div></div><div className="admin-card"><p>Memuat data...</p></div></>);

  const reqGroup = (title, key) => (
    <>
      <div className="admin-form-grid"><label className="wide"><span>Judul Grup</span><input value={form.sinas_data[`${key}_title`] || ""} onChange={(e) => setForm((p) => ({ ...p, sinas_data: { ...p.sinas_data, [`${key}_title`]: e.target.value } }))} /></label></div>
      {(form.sinas_data[`${key}_requirements`] || []).map((r, i) => (
        <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
          <button type="button" onClick={() => delArr(`${key}_requirements`, i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
          <label className="wide"><span>Syarat {i + 1}</span><input value={r} onChange={(e) => arr(`${key}_requirements`, i, e.target.value)} /></label>
        </div>
      ))}
      <button type="button" onClick={() => addArr(`${key}_requirements`)} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467", marginBottom: 16 }}>+ Tambah Syarat</button>
    </>
  );

  const fileField = (field, label, accept) => (
    <label className="wide"><span>{label}</span><div><input type="file" accept={accept} onChange={(e) => uploadFile(field, e.target.files[0])} />{uploading[field] && <span>Uploading...</span>}{form.sinas_data[field] && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.sinas_data[field]}</p>}</div></label>
  );

  return (
    <>
      <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman SIINas</h1></div></div>
      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Konten</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Intro</span><input value={form.sinas_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, sinas_data: { ...p.sinas_data, intro: e.target.value } }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.sinas_data.description || ""} onChange={(e) => setForm((p) => ({ ...p, sinas_data: { ...p.sinas_data, description: e.target.value } }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Persyaratan Registrasi</h2>
          {reqGroup("registrasi", "registrasi")}
          <h2 style={{ marginTop: 28 }}>Persyaratan Upload Dokumen</h2>
          {reqGroup("dokumen", "dokumen")}
          <h2 style={{ marginTop: 28 }}>Download & Flowchart</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Label Tombol Download</span><input value={form.sinas_data.download_label || ""} onChange={(e) => setForm((p) => ({ ...p, sinas_data: { ...p.sinas_data, download_label: e.target.value } }))} /></label>
            {fileField("download_file", "File Download (PDF)", ".pdf")}
            {fileField("flowchart", "Flowchart (gambar)", "image/*")}
          </div>
          <div className="admin-actions" style={{ marginTop: 28 }}><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    </>
  );
}

function LayananTeraAdmin() {
  const [form, setForm] = useState({ title: "", eyebrow: "", tera_data: { intro: "", description: "", requirements: [""], download_label: "", download_file: "", booking_label: "", booking_url: "", flowchart1_title: "", flowchart1: "", flowchart2_title: "", flowchart2: "" } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf }, credentials: "same-origin", body });
      const r = await res.json();
      if (r?.data?.path) setForm((p) => ({ ...p, tera_data: { ...p.tera_data, [field]: r.data.path } }));
    } catch { /* ignore */ } finally { setUploading((p) => ({ ...p, [field]: false })); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/admin/layanan-tera");
        const d = res.data || {};
        setForm({ title: d.title || "", eyebrow: d.eyebrow || "", tera_data: d.tera_data || { intro: "", description: "", requirements: [""], download_label: "", download_file: "", booking_label: "", booking_url: "", flowchart1_title: "", flowchart1: "", flowchart2_title: "", flowchart2: "" } });
      } catch { setMessage("Gagal memuat data."); } finally { setLoading(false); }
    })();
  }, []);

  const arr = (key, i, v) => setForm((p) => { const a = [...(p.tera_data[key] || [])]; a[i] = v; return { ...p, tera_data: { ...p.tera_data, [key]: a } }; });
  const addArr = (key) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, [key]: [...(p.tera_data[key] || []), ""] } }));
  const delArr = (key, i) => setForm((p) => { const a = [...(p.tera_data[key] || [])]; a.splice(i, 1); return { ...p, tera_data: { ...p.tera_data, [key]: a } }; });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try { await api("/api/admin/layanan-tera", { method: "POST", body: JSON.stringify({ title: form.title, eyebrow: form.eyebrow, tera_data: form.tera_data }) }); setMessage("Data berhasil disimpan."); } catch (err) { setMessage("Gagal: " + err.message); } finally { setSaving(false); }
  };

  if (loading) return (<><div className="admin-header"><div><p>Pengaturan</p><h1>Tera / Tera Ulang</h1></div></div><div className="admin-card"><p>Memuat data...</p></div></>);

  const fileField = (field, label, accept) => (
    <label className="wide"><span>{label}</span><div><input type="file" accept={accept} onChange={(e) => uploadFile(field, e.target.files[0])} />{uploading[field] && <span>Uploading...</span>}{form.tera_data[field] && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.tera_data[field]}</p>}</div></label>
  );

  return (
    <>
      <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman Tera / Tera Ulang</h1></div></div>
      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Konten</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Intro</span><input value={form.tera_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, intro: e.target.value } }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.tera_data.description || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, description: e.target.value } }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Persyaratan</h2>
          {(form.tera_data.requirements || []).map((r, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => delArr("requirements", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label className="wide"><span>Syarat {i + 1}</span><input value={r} onChange={(e) => arr("requirements", i, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={() => addArr("requirements")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467", marginBottom: 16 }}>+ Tambah Syarat</button>
          <h2 style={{ marginTop: 28 }}>Download & Booking</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Label Tombol Download</span><input value={form.tera_data.download_label || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, download_label: e.target.value } }))} /></label>
            {fileField("download_file", "File Download (PDF)", ".pdf")}
            <label className="wide"><span>Label Tombol Booking</span><input value={form.tera_data.booking_label || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, booking_label: e.target.value } }))} /></label>
            <label className="wide"><span>URL Booking</span><input value={form.tera_data.booking_url || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, booking_url: e.target.value } }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Flowchart</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Flowchart 1</span><input value={form.tera_data.flowchart1_title || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, flowchart1_title: e.target.value } }))} /></label>
            {fileField("flowchart1", "Gambar Flowchart 1", "image/*")}
            <label className="wide"><span>Judul Flowchart 2</span><input value={form.tera_data.flowchart2_title || ""} onChange={(e) => setForm((p) => ({ ...p, tera_data: { ...p.tera_data, flowchart2_title: e.target.value } }))} /></label>
            {fileField("flowchart2", "Gambar Flowchart 2", "image/*")}
          </div>
          <div className="admin-actions" style={{ marginTop: 28 }}><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    </>
  );
}

function LayananTdgAdmin() {
  const [form, setForm] = useState({ title: "", eyebrow: "", tdg_data: { intro: "", description: "", requirements: [""], download_label: "", download_file: "", flowchart: "" } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf }, credentials: "same-origin", body });
      const r = await res.json();
      if (r?.data?.path) setForm((p) => ({ ...p, tdg_data: { ...p.tdg_data, [field]: r.data.path } }));
    } catch { /* ignore */ } finally { setUploading((p) => ({ ...p, [field]: false })); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/admin/layanan-tdg");
        const d = res.data || {};
        setForm({ title: d.title || "", eyebrow: d.eyebrow || "", tdg_data: d.tdg_data || { intro: "", description: "", requirements: [""], download_label: "", download_file: "", flowchart: "" } });
      } catch { setMessage("Gagal memuat data."); } finally { setLoading(false); }
    })();
  }, []);

  const arr = (key, i, v) => setForm((p) => { const a = [...(p.tdg_data[key] || [])]; a[i] = v; return { ...p, tdg_data: { ...p.tdg_data, [key]: a } }; });
  const addArr = (key) => setForm((p) => ({ ...p, tdg_data: { ...p.tdg_data, [key]: [...(p.tdg_data[key] || []), ""] } }));
  const delArr = (key, i) => setForm((p) => { const a = [...(p.tdg_data[key] || [])]; a.splice(i, 1); return { ...p, tdg_data: { ...p.tdg_data, [key]: a } }; });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try { await api("/api/admin/layanan-tdg", { method: "POST", body: JSON.stringify({ title: form.title, eyebrow: form.eyebrow, tdg_data: form.tdg_data }) }); setMessage("Data berhasil disimpan."); } catch (err) { setMessage("Gagal: " + err.message); } finally { setSaving(false); }
  };

  if (loading) return (<><div className="admin-header"><div><p>Pengaturan</p><h1>Tanda Daftar Gudang</h1></div></div><div className="admin-card"><p>Memuat data...</p></div></>);

  const fileField = (field, label, accept) => (
    <label className="wide"><span>{label}</span><div><input type="file" accept={accept} onChange={(e) => uploadFile(field, e.target.files[0])} />{uploading[field] && <span>Uploading...</span>}{form.tdg_data[field] && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.tdg_data[field]}</p>}</div></label>
  );

  return (
    <>
      <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman Tanda Daftar Gudang</h1></div></div>
      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Konten</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Intro</span><input value={form.tdg_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, tdg_data: { ...p.tdg_data, intro: e.target.value } }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.tdg_data.description || ""} onChange={(e) => setForm((p) => ({ ...p, tdg_data: { ...p.tdg_data, description: e.target.value } }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Persyaratan</h2>
          {(form.tdg_data.requirements || []).map((r, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => delArr("requirements", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label className="wide"><span>Syarat {i + 1}</span><input value={r} onChange={(e) => arr("requirements", i, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={() => addArr("requirements")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467", marginBottom: 16 }}>+ Tambah Syarat</button>
          <h2 style={{ marginTop: 28 }}>Download & Flowchart</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Label Tombol Download</span><input value={form.tdg_data.download_label || ""} onChange={(e) => setForm((p) => ({ ...p, tdg_data: { ...p.tdg_data, download_label: e.target.value } }))} /></label>
            {fileField("download_file", "File Download (PDF)", ".pdf")}
          </div>
          <div className="admin-form-grid">
            {fileField("flowchart", "Gambar Flowchart", "image/*")}
          </div>
          <div className="admin-actions" style={{ marginTop: 28 }}><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    </>
  );
}

function LayananMinholAdmin() {
  const [form, setForm] = useState({ title: "", eyebrow: "", minhol_data: { intro: "", description: "", requirements: [""], download_label: "", download_file: "", flowchart: "" } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf }, credentials: "same-origin", body });
      const r = await res.json();
      if (r?.data?.path) setForm((p) => ({ ...p, minhol_data: { ...p.minhol_data, [field]: r.data.path } }));
    } catch { /* ignore */ } finally { setUploading((p) => ({ ...p, [field]: false })); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/admin/layanan-minhol");
        const d = res.data || {};
        setForm({ title: d.title || "", eyebrow: d.eyebrow || "", minhol_data: d.minhol_data || { intro: "", description: "", requirements: [""], download_label: "", download_file: "", flowchart: "" } });
      } catch { setMessage("Gagal memuat data."); } finally { setLoading(false); }
    })();
  }, []);

  const arr = (key, i, v) => setForm((p) => { const a = [...(p.minhol_data[key] || [])]; a[i] = v; return { ...p, minhol_data: { ...p.minhol_data, [key]: a } }; });
  const addArr = (key) => setForm((p) => ({ ...p, minhol_data: { ...p.minhol_data, [key]: [...(p.minhol_data[key] || []), ""] } }));
  const delArr = (key, i) => setForm((p) => { const a = [...(p.minhol_data[key] || [])]; a.splice(i, 1); return { ...p, minhol_data: { ...p.minhol_data, [key]: a } }; });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try { await api("/api/admin/layanan-minhol", { method: "POST", body: JSON.stringify({ title: form.title, eyebrow: form.eyebrow, minhol_data: form.minhol_data }) }); setMessage("Data berhasil disimpan."); } catch (err) { setMessage("Gagal: " + err.message); } finally { setSaving(false); }
  };

  if (loading) return (<><div className="admin-header"><div><p>Pengaturan</p><h1>Perpanjangan Minuman Beralkohol</h1></div></div><div className="admin-card"><p>Memuat data...</p></div></>);

  const fileField = (field, label, accept) => (
    <label className="wide"><span>{label}</span><div><input type="file" accept={accept} onChange={(e) => uploadFile(field, e.target.files[0])} />{uploading[field] && <span>Uploading...</span>}{form.minhol_data[field] && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.minhol_data[field]}</p>}</div></label>
  );

  return (
    <>
      <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman Perpanjangan Minuman Beralkohol</h1></div></div>
      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Hero</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Subtitle (Eyebrow)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Konten</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Judul Intro</span><input value={form.minhol_data.intro || ""} onChange={(e) => setForm((p) => ({ ...p, minhol_data: { ...p.minhol_data, intro: e.target.value } }))} /></label>
            <label className="wide"><span>Deskripsi</span><textarea value={form.minhol_data.description || ""} onChange={(e) => setForm((p) => ({ ...p, minhol_data: { ...p.minhol_data, description: e.target.value } }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Persyaratan</h2>
          {(form.minhol_data.requirements || []).map((r, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => delArr("requirements", i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label className="wide"><span>Syarat {i + 1}</span><input value={r} onChange={(e) => arr("requirements", i, e.target.value)} /></label>
            </div>
          ))}
          <button type="button" onClick={() => addArr("requirements")} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467", marginBottom: 16 }}>+ Tambah Syarat</button>
          <h2 style={{ marginTop: 28 }}>Download & Flowchart</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>Label Tombol Download</span><input value={form.minhol_data.download_label || ""} onChange={(e) => setForm((p) => ({ ...p, minhol_data: { ...p.minhol_data, download_label: e.target.value } }))} /></label>
            {fileField("download_file", "File Download (PDF)", ".pdf")}
          </div>
          <div className="admin-form-grid">
            {fileField("flowchart", "Gambar Flowchart", "image/*")}
          </div>
          <div className="admin-actions" style={{ marginTop: 28 }}><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div>
          {message && <p className="admin-message">{message}</p>}
        </form>
      </div>
    </>
  );
}

function ZonaIntegritasAdmin() {
  const [form, setForm] = useState({ title: "", eyebrow: "", zi_data: { hero_title: "", hero_subtitle: "", about_title: "", about_text: "", about_image: "", buttons: [] } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState({});

  const uploadFile = async (field, file) => {
    if (!file) return;
    setUploading((p) => ({ ...p, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", headers: { Accept: "application/json", "X-CSRF-TOKEN": csrf }, credentials: "same-origin", body });
      const r = await res.json();
      if (r?.data?.path) {
        if (field === "about_image") setForm((p) => ({ ...p, zi_data: { ...p.zi_data, about_image: r.data.path } }));
        else setForm((p) => { const btns = [...(p.zi_data.buttons || [])]; const idx = parseInt(field); if (btns[idx]) btns[idx] = { ...btns[idx], image: r.data.path }; return { ...p, zi_data: { ...p.zi_data, buttons: btns } }; });
      }
    } catch { /* ignore */ } finally { setUploading((p) => ({ ...p, [field]: false })); }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api("/api/admin/zona-integritas");
        const d = res.data || {};
        setForm({ title: d.title || "", eyebrow: d.eyebrow || "", zi_data: d.zi_data || { hero_title: "", hero_subtitle: "", about_title: "", about_text: "", about_image: "", buttons: [] } });
      } catch { setMessage("Gagal memuat data."); } finally { setLoading(false); }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try { await api("/api/admin/zona-integritas", { method: "POST", body: JSON.stringify({ title: form.title, eyebrow: form.eyebrow, zi_data: form.zi_data }) }); setMessage("Data berhasil disimpan."); } catch (err) { setMessage("Gagal: " + err.message); } finally { setSaving(false); }
  };

  const btnUpd = (i, k, v) => setForm((p) => { const btns = [...(p.zi_data.buttons || [])]; if (!btns[i]) btns[i] = { label: "", image: "", url: "" }; btns[i] = { ...btns[i], [k]: v }; return { ...p, zi_data: { ...p.zi_data, buttons: btns } }; });
  const btnAdd = () => setForm((p) => ({ ...p, zi_data: { ...p.zi_data, buttons: [...(p.zi_data.buttons || []), { label: "", image: "", url: "" }] } }));
  const btnDel = (i) => setForm((p) => { const btns = [...(p.zi_data.buttons || [])]; btns.splice(i, 1); return { ...p, zi_data: { ...p.zi_data, buttons: btns } }; });

  if (loading) return (<><div className="admin-header"><div><p>Pengaturan</p><h1>Zona Integritas</h1></div></div><div className="admin-card"><p>Memuat data...</p></div></>);

  return (
    <>
      <div className="admin-header"><div><p>Pengaturan</p><h1>Halaman Zona Integritas</h1></div></div>
      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <h2>Hero Section</h2>
          <div className="admin-form-grid">
            <label><span>Judul Halaman (SEO)</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></label>
            <label><span>Eyebrow (SEO)</span><input value={form.eyebrow} onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))} /></label>
          </div>
          <div className="admin-form-grid">
            <label><span>Hero Title</span><input value={form.zi_data.hero_title || ""} onChange={(e) => setForm((p) => ({ ...p, zi_data: { ...p.zi_data, hero_title: e.target.value } }))} /></label>
            <label><span>Hero Subtitle</span><input value={form.zi_data.hero_subtitle || ""} onChange={(e) => setForm((p) => ({ ...p, zi_data: { ...p.zi_data, hero_subtitle: e.target.value } }))} /></label>
          </div>
          <h2 style={{ marginTop: 28 }}>About Section</h2>
          <div className="admin-form-grid">
            <label className="wide"><span>About Title</span><input value={form.zi_data.about_title || ""} onChange={(e) => setForm((p) => ({ ...p, zi_data: { ...p.zi_data, about_title: e.target.value } }))} /></label>
            <label className="wide"><span>About Text</span><textarea rows={4} value={form.zi_data.about_text || ""} onChange={(e) => setForm((p) => ({ ...p, zi_data: { ...p.zi_data, about_text: e.target.value } }))} /></label>
            <label className="wide"><span>About Image (lingkaran)</span><div><input type="file" accept="image/*" onChange={(e) => uploadFile("about_image", e.target.files[0])} />{uploading["about_image"] && <span>Uploading...</span>}{form.zi_data.about_image && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{form.zi_data.about_image}</p>}</div></label>
          </div>
          <h2 style={{ marginTop: 28 }}>Tombol Area (3x2)</h2>
          {(form.zi_data.buttons || []).map((btn, i) => (
            <div key={i} className="admin-form-grid" style={{ border: "1px solid #eaecf0", borderRadius: 8, padding: 16, marginBottom: 12, position: "relative" }}>
              <button type="button" onClick={() => btnDel(i)} style={{ position: "absolute", top: 8, right: 8, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>Hapus</button>
              <label><span>Label {i + 1}</span><input value={btn.label || ""} onChange={(e) => btnUpd(i, "label", e.target.value)} /></label>
              <label><span>URL Tujuan</span><input value={btn.url || ""} onChange={(e) => btnUpd(i, "url", e.target.value)} /></label>
              <label className="wide"><span>Gambar {i + 1}</span><div><input type="file" accept="image/*" onChange={(e) => uploadFile(String(i), e.target.files[0])} />{uploading[String(i)] && <span>Uploading...</span>}{btn.image && <p style={{ fontSize: 12, color: "#344054", margin: "4px 0 0" }}>{btn.image}</p>}</div></label>
            </div>
          ))}
          <button type="button" onClick={btnAdd} style={{ background: "none", border: "1px dashed #d0d5dd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", width: "100%", fontSize: 13, color: "#475467", marginBottom: 16 }}>+ Tambah Tombol</button>
          <div className="admin-actions" style={{ marginTop: 28 }}><button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</button></div>
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

function PricesAdmin() {
  const [markets, setMarkets] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("");
  const [prices, setPrices] = useState({});
  const [priceDate, setPriceDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { api("/api/admin/markets").then((d) => setMarkets((d.data || []).filter((m) => m.category === "Pasar Rakyat"))).catch(() => {}); }, []);

  const loadCommodities = async (marketId) => {
    if (!marketId) return;
    setLoading(true); setMessage("");
    try {
      const [comRes, priceRes] = await Promise.all([
        api("/api/admin/commodities"),
        api(`/api/admin/prices?market_id=${marketId}&start_date=${priceDate}&end_date=${priceDate}&limit=200`),
      ]);
      const allCom = comRes.data || [];
      const existingPrices = priceRes.data || [];
      const priceMap = {};
      existingPrices.forEach((p) => { priceMap[p.komoditas_id] = p.price; });
      setCommodities(allCom);
      setPrices(priceMap);
    } catch { setMessage("Gagal memuat data."); } finally { setLoading(false); }
  };

  const handleMarketChange = (e) => {
    const val = e.target.value;
    setSelectedMarket(val);
    if (val) loadCommodities(val);
    else { setCommodities([]); setPrices({}); }
  };

  const updatePrice = (komoditasId, val) => {
    setPrices((p) => ({ ...p, [komoditasId]: val === "" ? "" : Number(val) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedMarket) { setMessage("Pilih pasar terlebih dahulu."); return; }
    setSaving(true); setMessage("");
    const entries = Object.entries(prices).filter(([, v]) => v !== "" && v !== null);
    if (entries.length === 0) { setMessage("Tidak ada harga yang diisi."); setSaving(false); return; }
    const payload = {
      pasar_id: selectedMarket,
      price_date: priceDate,
      prices: entries.map(([komoditasId, price]) => ({ komoditas_id: Number(komoditasId), price })),
    };
    try {
      const res = await api("/api/admin/prices/bulk", { method: "POST", body: JSON.stringify(payload) });
      setMessage(`Berhasil menyimpan ${res.count || "semua"} data harga.`);
    } catch (err) { setMessage("Gagal menyimpan: " + (err.message || "")); } finally { setSaving(false); }
  };

  return (
    <>
      <div className="admin-header"><div><p>Pengaturan</p><h1>Input Harga Komoditas</h1></div></div>
      <div className="admin-card">
        <form onSubmit={submit} className="admin-form">
          <div className="admin-form-grid">
            <label><span>Pasar</span>
              <select value={selectedMarket} onChange={handleMarketChange}>
                <option value="">-- Pilih Pasar --</option>
                {markets.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
              </select>
            </label>
            <label><span>Tanggal</span>
              <input type="date" value={priceDate} onChange={(e) => setPriceDate(e.target.value)} />
            </label>
          </div>

          {loading && <p style={{ margin: "16px 0", color: "#64748b" }}>Memuat komoditas...</p>}

          {!loading && commodities.length > 0 && (
            <>
              <div style={{ overflowX: "auto", marginTop: 20 }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: 50, textAlign: "center" }}>No</th>
                      <th style={{ textAlign: "left" }}>Komoditas</th>
                      <th style={{ width: 160, textAlign: "right" }}>Harga (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commodities.map((com, i) => (
                      <tr key={com.id}>
                        <td style={{ textAlign: "center", color: "#64748b", fontSize: 13 }}>{i + 1}</td>
                        <td>
                          <strong style={{ fontSize: 14 }}>{com.name}</strong>
                          {com.unit && <span style={{ color: "#64748b", fontSize: 12, marginLeft: 6 }}>/ {com.unit}</span>}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <input
                            type="number"
                            min="0"
                            style={{ width: 140, textAlign: "right" }}
                            placeholder="0"
                            value={prices[com.id] ?? ""}
                            onChange={(e) => updatePrice(com.id, e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="admin-actions" style={{ marginTop: 20 }}>
                <button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Simpan Semua Harga"}</button>
              </div>
            </>
          )}

          {!loading && selectedMarket && commodities.length === 0 && (
            <p style={{ margin: "16px 0", color: "#64748b" }}>Tidak ada komoditas tersedia.</p>
          )}

          {message && <p className="admin-message" style={{ marginTop: 12 }}>{message}</p>}
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
      <AdminLayout menus={[]} groups={menuGroups}>
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
      <AdminLayout menus={menus} groups={menuGroups}>
        <div className="admin-header">
          <h1>Akses Ditolak</h1>
          <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </AdminLayout>
    );
  }

  const config = resources[activeKey];

  return (
    <AdminLayout menus={menus} groups={menuGroups}>
      {activeKey === "dashboard" ? (
        <Dashboard />
      ) : activeKey === "prices-monitor" ? (
        <PriceMonitoring />
      ) : activeKey === "tentang" ? (
        <TentangAdmin />
      ) : activeKey === "program-kegiatan" ? (
        <ProgramKegiatanAdmin />
      ) : activeKey === "layanan-halal" ? (
        <LayananHalalAdmin />
      ) : activeKey === "layanan-merk" ? (
        <LayananMerkAdmin />
      ) : activeKey === "layanan-sinas" ? (
        <LayananSinasAdmin />
      ) : activeKey === "layanan-tera" ? (
        <LayananTeraAdmin />
      ) : activeKey === "layanan-tdg" ? (
        <LayananTdgAdmin />
      ) : activeKey === "layanan-minhol" ? (
        <LayananMinholAdmin />
      ) : activeKey === "zona-integritas" ? (
        <ZonaIntegritasAdmin />
      ) : activeKey === "ikm" ? (
        <IkmAdmin />
      ) : activeKey === "prices" ? (
        <PricesAdmin />
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
