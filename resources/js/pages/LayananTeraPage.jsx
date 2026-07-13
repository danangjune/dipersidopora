import { useEffect, useState } from "react";
import { apiGet, asset } from "../data/siteContent";

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

export default function LayananTeraPage() {
  const [page, setPage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/layanan-tera")
      .then((d) => {
        if (active) {
          setPage(d);
          setData(d.tera_data || {});
        }
      })
      .catch(() => { if (active) setPage(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <section className="section">
      <div className="sectionSubhead">
        <h2>{page?.title || "Tera / Tera Ulang"}</h2>
        <p>{page?.excerpt || "Informasi prosedur tera dan tera ulang."}</p>
      </div>

      <div className="halalCard">
        <h3>{data.intro}</h3>
        <p>{data.description}</p>
        <ul className="halalList">
          {(data.requirements || []).map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {data.download_file && (
            <a href={asset(data.download_file)} className="halalDownload" target="_blank" rel="noopener noreferrer">
              {data.download_label || "Unduh Panduan"}
            </a>
          )}
          {data.booking_url && (
            <a href={data.booking_url} className="halalDownload" style={{ background: "#d97706" }} target="_blank" rel="noopener noreferrer">
              {data.booking_label || "Booking Tera"}
            </a>
          )}
        </div>
      </div>

      {data.flowchart1 && (
        <div className="halalFlowchart">
          <h3>{data.flowchart1_title || "Flowchart"}</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart1)} alt={data.flowchart1_title || "Flowchart"} />
          </div>
        </div>
      )}

      {data.flowchart2 && (
        <div className="halalFlowchart">
          <h3>{data.flowchart2_title || "Flowchart"}</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart2)} alt={data.flowchart2_title || "Flowchart"} />
          </div>
        </div>
      )}
    </section>
  );
}
