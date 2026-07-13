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

export default function ZonaIntegritasPage() {
  const [page, setPage] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/zona-integritas")
      .then((d) => {
        if (active) {
          setPage(d);
          setData(d.zi_data || {});
        }
      })
      .catch(() => { if (active) setPage(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  return (
    <>
      <section className="ziHero">
        <div className="ziHeroBg" />
        <div className="ziHeroContent">
          <span className="ziHeroBadge">{page?.eyebrow || "Reformasi Birokrasi"}</span>
          <h1 className="ziHeroTitle">{data.hero_title || "Zona Integritas"}</h1>
          <p className="ziHeroSub">{data.hero_subtitle || ""}</p>
        </div>
      </section>

      <section className="section">
        <div className="ziAbout">
          <div className="ziAboutImg">
            {data.about_image ? (
              <img src={asset(data.about_image)} alt="Tanda Tanya" />
            ) : (
              <div className="ziAboutIcon">?</div>
            )}
          </div>
          <div className="ziAboutText">
            <h2>{data.about_title || "Apa itu Zona Integritas?"}</h2>
            <p>{data.about_text || ""}</p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="ziGrid">
          {(data.buttons || []).map((btn, i) => (
            <a key={i} href={btn.url || "#"} className="ziBtn">
              <div className="ziBtnCircle">
                <img src={asset(btn.image)} alt={btn.label} />
              </div>
              <span className="ziBtnLabel">{btn.label}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
