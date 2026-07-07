import { useEffect, useState } from "react";
import { asset, apiGet } from "../data/siteContent";

function StrukturPageLoaded({ page }) {
  const heroTitle = page.title || "Struktur Organisasi";
  const heroEyebrow = page.eyebrow || "Profil";
  const logo = "images/d1.png";
  const strukturImage = page.image || "";

  return (
    <>
      <section className="tentangHero">
        <div className="tentangHeroContent">
          <span>{heroEyebrow}</span>
          <h1>{heroTitle}</h1>
        </div>
      </section>

      <section className="section">
        <div className="tentangLogo">
          <img src={asset(logo)} alt="DISPERDAGIN Kota Kediri" />
        </div>

        {strukturImage && (
          <div className="strukturBagan">
            <img src={asset(strukturImage)} alt="Struktur Organisasi DISPERDAGIN Kota Kediri" />
          </div>
        )}
      </section>
    </>
  );
}

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

export default function StrukturPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/page/struktur")
      .then((data) => {
        if (active) setPage(data);
      })
      .catch(() => {
        if (active) setPage(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;
  if (!page) return <Loading />;

  return <StrukturPageLoaded page={page} />;
}
