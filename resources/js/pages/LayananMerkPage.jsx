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

export default function LayananMerkPage() {
  const [page, setPage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/layanan-merk")
      .then((d) => {
        if (active) {
          setPage(d);
          setData(d.merk_data || {});
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
        <h2>{page?.title || "Legalitas Merk"}</h2>
        <p>{page?.excerpt || "Informasi prosedur legalitas merk."}</p>
      </div>

      <div className="halalCard">
        <h3>{data.intro}</h3>
        <p>{data.description}</p>

        {data.mandiri_title && (
          <>
            <h4 style={{ margin: "16px 0 8px", fontSize: 15, color: "#0f2d52" }}>{data.mandiri_title}</h4>
            <ul className="halalList">
              {(data.mandiri_requirements || []).map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </>
        )}

        {data.fasilitas_title && (
          <>
            <h4 style={{ margin: "16px 0 8px", fontSize: 15, color: "#0f2d52" }}>{data.fasilitas_title}</h4>
            <ul className="halalList">
              {(data.fasilitas_requirements || []).map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </>
        )}

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

      {data.flowchart && (
        <div className="halalFlowchart">
          <h3>Flowchart Legalitas Merek</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart)} alt="Flowchart Legalitas Merek" />
          </div>
        </div>
      )}
    </section>
  );
}
