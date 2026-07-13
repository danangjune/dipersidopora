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

export default function LayananHalalPage() {
  const [page, setPage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/layanan-halal")
      .then((d) => {
        if (active) {
          setPage(d);
          setData(d.halal_data || {});
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
        <h2>{page?.title || "Sertifikasi Halal"}</h2>
        <p>{page?.excerpt || "Informasi prosedur sertifikasi halal."}</p>
      </div>

      <div className="halalCard">
        <h3>{data.intro}</h3>
        <p>{data.description}</p>
        <ul className="halalList">
          {(data.requirements || []).map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
        {data.download_file && (
          <a
            href={asset(data.download_file)}
            className="halalDownload"
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.download_label || "Unduh Panduan"}
          </a>
        )}
      </div>

      {data.flowchart_reguler && (
        <div className="halalFlowchart">
          <h3>Flowchart Sertifikasi Halal Reguler</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart_reguler)} alt="Flowchart Sertifikasi Halal Reguler" />
          </div>
        </div>
      )}

      {data.flowchart_gratis && (
        <div className="halalFlowchart">
          <h3>Flowchart Sertifikasi Halal Gratis (SEHATI)</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart_gratis)} alt="Flowchart Sertifikasi Halal Gratis" />
          </div>
        </div>
      )}
    </section>
  );
}
