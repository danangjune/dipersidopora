import { useEffect, useState } from "react";
import { asset, apiGet } from "../data/siteContent";

function ProgramKegiatanLoaded({ page, programData }) {
  const { intro = "", programs = [] } = programData;
  const logo = "images/d1.png";

  return (
    <>
      <section className="tentangHero">
        <div className="tentangHeroContent">
          <span>{page.eyebrow || "Profil"}</span>
          <h1>{page.title || "Program Kegiatan"}</h1>
        </div>
      </section>

      <section className="section">
        <div className="tentangLogo">
          <img src={asset(logo)} alt="DISPERDAGIN Kota Kediri" />
        </div>

        <div className="programKegiatan">
          {intro && (
            <div className="programKegiatanIntro">
              <p>{intro}</p>
            </div>
          )}

          {programs.length > 0 && (
            <div className="programKegiatanList">
              {programs.map((prog) => (
                <div key={prog.number} className="programKegiatanItem">
                  <div className="programKegiatanNum">{prog.number}</div>
                  <div className="programKegiatanContent">
                    <h3>{prog.title}</h3>
                    <p>{prog.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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

export default function ProgramKegiatanPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/program-kegiatan")
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

  return (
    <ProgramKegiatanLoaded
      page={page}
      programData={page.program_data || {}}
    />
  );
}
