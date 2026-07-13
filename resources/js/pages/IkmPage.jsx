import { useEffect, useState } from "react";
import { apiGet } from "../data/siteContent";

const categoryLabels = {
  fashion: "Fashion",
  kerajinan: "Kerajinan",
  makanan_minuman: "Makanan & Minuman",
  lainnya: "Lainnya",
};

const categoryColors = {
  fashion: "#e11d48",
  kerajinan: "#d97706",
  makanan_minuman: "#16a34a",
  lainnya: "#6366f1",
};

function Loading() {
  return (
    <section className="section">
      <div className="loadingState">
        <div className="loadingSpinner" />
        <p>Memuat halaman...</p>
      </div>
    </section>
  );
}

export default function IkmPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");

  useEffect(() => {
    let active = true;
    apiGet("/api/site/ikm")
      .then((d) => { if (active) setData(d || []); })
      .catch(() => { if (active) setData([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = filter === "Semua"
    ? data
    : data.filter((item) => item.category === filter);

  if (loading) return <Loading />;

  return (
    <section className="section">
      <div className="sectionSubhead">
        <h2>Industri Kecil Menengah</h2>
        <p>Data IKM binaan DISPERDAGIN Kota Kediri</p>
      </div>

      <div className="ikmFilter">
        <button
          className={`ikmFilterBtn ${filter === "Semua" ? "active" : ""}`}
          onClick={() => setFilter("Semua")}
        >
          Semua
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            className={`ikmFilterBtn ${filter === key ? "active" : ""}`}
            style={filter === key ? { background: categoryColors[key] } : {}}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Alamat</th>
              <th>Kelurahan</th>
              <th>No. HP</th>
              <th>Lokasi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#667085" }}>
                  Tidak ada data IKM untuk kategori ini.
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.name}</td>
                  <td style={{ maxWidth: 260, whiteSpace: "normal", lineHeight: 1.4 }}>{item.address || "-"}</td>
                  <td>{item.kelurahan || "-"}</td>
                  <td>{item.contact || "-"}</td>
                  <td>
                    {item.location ? (
                      <a href={item.location} target="_blank" rel="noopener noreferrer" className="ikmMapLink">Maps</a>
                    ) : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
