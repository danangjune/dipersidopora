import { useEffect, useState } from "react";

export function PklDashboard() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [stats, setStats] = useState(null);
  const load = () => {
    fetch(`/api/pedagang?q=${encodeURIComponent(q)}&per_page=50`)
      .then((r) => r.json())
      .then((d) => setRows(d.data || []));
    fetch("/api/pedagang/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data));
  };
  useEffect(load, []);

  return (
    <section className="section">
      <div className="sectionTitle">
        <span>PKL</span>
        <h1>Dashboard Data Pedagang</h1>
        <p>
          Pengganti modul native `pkl/dashboard.php`, sekarang CRUD lewat API
          resource Laravel.
        </p>
      </div>
      <div className="statGrid">
        <div>
          <strong>{stats?.total ?? 0}</strong>
          <span>Total Pedagang</span>
        </div>
        <div>
          <strong>{stats?.status?.true ?? 0}</strong>
          <span>Tervalidasi</span>
        </div>
        <div>
          <strong>{stats?.status?.pending ?? 0}</strong>
          <span>Pending</span>
        </div>
      </div>
      <div className="toolbar">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama usaha/pemilik/registrasi"
        />
        <button className="btn" onClick={load}>
          Cari
        </button>
        <a className="btn outline" href="/api/pedagang/export">
          Export CSV
        </a>
        <a className="btn" href="/pkl/input">
          Input Pedagang
        </a>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>No Registrasi</th>
              <th>Nama Pemilik</th>
              <th>Nama Usaha</th>
              <th>Kecamatan</th>
              <th>Jenis Jualan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td>{i + 1}</td>
                <td>{r.no_registrasi}</td>
                <td>{r.nama_pemilik}</td>
                <td>{r.nama_usaha}</td>
                <td>{r.kecamatan}</td>
                <td>{r.jenis_jualan}</td>
                <td>
                  <span className={`badge ${r.status_validasi}`}>
                    {r.status_validasi}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function PklInput() {
  const [form, setForm] = useState({ status_validasi: "pending" });
  const [message, setMessage] = useState("");
  const set = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (e) => {
    e.preventDefault();
    setMessage("Menyimpan...");
    const body = new FormData();
    Object.entries(form).forEach(
      ([k, v]) => v !== undefined && v !== null && body.append(k, v),
    );
    const res = await fetch("/api/pedagang", {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
    });
    const data = await res.json();
    setMessage(data.message || (res.ok ? "Berhasil" : "Gagal"));
    if (res.ok) setForm({ status_validasi: "pending" });
  };
  return (
    <section className="section">
      <div className="sectionTitle">
        <span>PKL</span>
        <h1>Input Data Pedagang</h1>
        <p>
          Upload dibatasi hanya file gambar dan tersimpan ke storage Laravel,
          bukan folder web executable.
        </p>
      </div>
      <form className="cardForm wide" onSubmit={submit}>
        {[
          ["no_registrasi", "No Registrasi"],
          ["nik", "NIK"],
          ["nama_pemilik", "Nama Pemilik"],
          ["nama_usaha", "Nama Usaha"],
          ["kecamatan", "Kecamatan"],
          ["nama_kelurahan", "Kelurahan"],
          ["alamat_ktp", "Alamat KTP"],
          ["alamat_usaha", "Alamat Usaha"],
          ["deskripsi_alamat", "Deskripsi Alamat"],
          ["jenis_jualan", "Jenis Jualan"],
          ["jam_operasional", "Jam Operasional"],
          ["no_hp", "No HP"],
          ["latitude", "Latitude"],
          ["longitude", "Longitude"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={form[key] || ""}
              onChange={(e) => set(key, e.target.value)}
              required={["nama_pemilik"].includes(key)}
            />
          </label>
        ))}
        <label>
          Foto KTP
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set("foto_ktp", e.target.files[0])}
          />
        </label>
        <label>
          Foto NIB
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set("foto_nib", e.target.files[0])}
          />
        </label>
        <label>
          Foto Lapak
          <input
            type="file"
            accept="image/*"
            onChange={(e) => set("foto_lapak", e.target.files[0])}
          />
        </label>
        <button className="btn" type="submit">
          Simpan
        </button>
        {message && <p>{message}</p>}
      </form>
    </section>
  );
}
