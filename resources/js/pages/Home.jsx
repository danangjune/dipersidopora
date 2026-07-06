import { useCallback, useEffect, useRef, useState } from "react";
import { asset, apiGet } from "../data/siteContent";
import PriceWidget from "./PriceWidget";

function HeroSlider({ banners }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef(null);

  const goTo = useCallback((i) => {
    setCurrent(i);
    clearInterval(timer.current);
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    timer.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer.current);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="heroSlider">
        <div className="heroSlide">
          <img src={asset("images/project/Banner 1.png")} alt="DISPERDAGIN" />
        </div>
      </section>
    );
  }

  return (
    <section className="heroSlider">
      <div className="heroTrack" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((b) => (
          <div className="heroSlide" key={b.id}>
            {b.link_url ? (
              <a href={b.link_url} target="_blank" rel="noreferrer">
                <img src={asset(b.image)} alt={b.title || "Banner"} />
              </a>
            ) : (
              <img src={asset(b.image)} alt={b.title || "Banner"} />
            )}
            {b.title && (
              <div className="heroCaption">
                <h2>{b.title}</h2>
              </div>
            )}
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="heroDots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={i === current ? "active" : ""}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const [services, setServices] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    apiGet("/api/site/services")
      .then((items) => setServices(items || []))
      .catch(() => setServices([]));
    apiGet("/api/site/banners")
      .then((items) => setBanners(items || []))
      .catch(() => setBanners([]));
  }, []);

  return (
    <>
      <HeroSlider banners={banners} />

      <PriceWidget />

      <section className="section sectionServices">
        <div className="sectionTitle">
          <span>Layanan</span>
          <h1>Layanan DISPERDAGIN Kota Kediri</h1>
          <p>
            Akses layanan perdagangan, perindustrian, informasi harga, dan
            penguatan usaha.
          </p>
        </div>

        <div className="serviceGrid">
          {services.length === 0 && <p className="emptyText">Belum ada layanan tersedia.</p>}
          {services.map((item) => (
            <a
              className="serviceCard"
              href={item.external_url || `/${item.slug}`}
              key={item.id || item.slug}
              target={item.external_url ? "_blank" : undefined}
              rel={item.external_url ? "noreferrer" : undefined}
            >
              <div className="serviceIcon">
                {(item.title || "")
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <h3>{item.title}</h3>
              <p>{item.excerpt || item.content || "Informasi layanan DISPERDAGIN Kota Kediri."}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section sectionCta">
        <div className="ctaCard">
          <div className="ctaContent">
            <span>Survey Pelayanan</span>
            <h2>Bantu kami meningkatkan kualitas layanan</h2>
            <p>
              Isi survey kepuasan masyarakat secara singkat. Hasilnya tersimpan
              dan dapat ditampilkan real-time.
            </p>
          </div>
          <a className="btn btnCta" href="/survey">
            Isi Survey
          </a>
        </div>
      </section>
    </>
  );
}
