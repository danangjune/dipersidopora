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

export default function LayananSinasPage() {
  const [page, setPage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/layanan-sinas")
      .then((d) => {
        if (active) {
          setPage(d);
          setData(d.sinas_data || {});
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
        <h2>{page?.title || "SIINas"}</h2>
        <p>{page?.excerpt || "Informasi prosedur SIINas."}</p>
      </div>

      <div className="halalCard">
        <h3>{data.intro}</h3>
        <p>{data.description}</p>

        {data.registrasi_title && (
          <>
            <h4 style={{ margin: "16px 0 8px", fontSize: 15, color: "#0f2d52" }}>{data.registrasi_title}</h4>
            <ul className="halalList">
              {(data.registrasi_requirements || []).map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </>
        )}

        {data.dokumen_title && (
          <>
            <h4 style={{ margin: "16px 0 8px", fontSize: 15, color: "#0f2d52" }}>{data.dokumen_title}</h4>
            <ul className="halalList">
              {(data.dokumen_requirements || []).map((req, i) => (
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
          <h3>Flowchart SIINas</h3>
          <div className="halalFlowchartImg">
            <img src={asset(data.flowchart)} alt="Flowchart SIINas" />
          </div>
        </div>
      )}
    </section>
  );
}
