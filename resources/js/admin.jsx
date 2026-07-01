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
  { key: "markets", label: "Master Pasar", href: "/admin/markets" },
  { key: "commodities", label: "Master Komoditas", href: "/admin/commodities" },
  { key: "pages", label: "Master Halaman", href: "/admin/pages" },
  { key: "downloads", label: "Master Dokumen", href: "/admin/downloads" },
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
                className={field.type === "textarea" ? "wide" : ""}
              >
                <span>{field.label}</span>

                {field.type === "textarea" ? (
                  <textarea
                    required={field.required}
                    value={form[field.name] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [field.name]: e.target.value })
                    }
                  />
                ) : field.type === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(e) =>
                      setForm({ ...form, [field.name]: e.target.checked })
                    }
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    required={field.required}
                    value={form[field.name] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [field.name]: e.target.value })
                    }
                  />
                )}
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

function AdminApp() {
  const activeKey = getActiveKey();
  const config = resources[activeKey];

  return (
    <AdminLayout>
      {activeKey === "dashboard" ? (
        <Dashboard />
      ) : config ? (
        <CrudPage config={config} />
      ) : (
        <Dashboard />
      )}
    </AdminLayout>
  );
}

createRoot(document.getElementById("admin-root")).render(<AdminApp />);
