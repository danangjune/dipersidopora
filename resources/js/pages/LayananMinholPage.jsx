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

export default function LayananMinholPage() {
  const [page, setPage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/layanan-minhol")
      .then((d) => {
        if (active) {
          setPage(d);
          setData(d.minhol_data || {});
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
        <h2>{page?.title || "Perpanjangan Minuman Beralkohol"}</h2>
        <p>{page?.excerpt || "Informasi perpanjangan minuman beralkohol."}</p>
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
          <a href={asset(data.download_file)} className="halalDownload" target="_blank" rel="noopener noreferrer">
            {data.download_label || "Unduh Panduan"}
          </a>
        )}
      </div>

      {data.flowchart && (
        <div className="halalFlowchart">
          <h3>Flowchart Perpanjangan Minuman Beralkohol</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart)} alt="Flowchart Perpanjangan Minuman Beralkohol" />
          </div>
        </div>
      )}
    </section>
  );
}
