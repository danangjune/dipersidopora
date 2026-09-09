import { useCallback, useEffect, useRef, useState } from "react";
import { asset, apiGet } from "../data/siteContent";
import PriceWidget from "./PriceWidget";
import CheckBadgeIcon from "@heroicons/react/24/outline/CheckBadgeIcon";
import DocumentTextIcon from "@heroicons/react/24/outline/DocumentTextIcon";
import GlobeAltIcon from "@heroicons/react/24/outline/GlobeAltIcon";
import WrenchScrewdriverIcon from "@heroicons/react/24/outline/WrenchScrewdriverIcon";
import BuildingStorefrontIcon from "@heroicons/react/24/outline/BuildingStorefrontIcon";
import BanknotesIcon from "@heroicons/react/24/outline/BanknotesIcon";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";
import ArrowDownTrayIcon from "@heroicons/react/24/outline/ArrowDownTrayIcon";
import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";
import ScaleIcon from "@heroicons/react/24/outline/ScaleIcon";
import ShoppingBagIcon from "@heroicons/react/24/outline/ShoppingBagIcon";
import TruckIcon from "@heroicons/react/24/outline/TruckIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import PuzzlePieceIcon from "@heroicons/react/24/outline/PuzzlePieceIcon";

const iconMap = [
  { keywords: ["halal"], icon: CheckBadgeIcon },
  { keywords: ["merk", "legalitas"], icon: DocumentTextIcon },
  { keywords: ["sinas", "siinas"], icon: GlobeAltIcon },
  { keywords: ["tera"], icon: ScaleIcon },
  { keywords: ["gudang", "td-"], icon: BuildingStorefrontIcon },
  { keywords: ["minhol", "alkohol", "minuman"], icon: DocumentTextIcon },
  { keywords: ["modal", "bantuan"], icon: BanknotesIcon },
  { keywords: ["harga", "informasi pasar"], icon: ChartBarIcon },
  { keywords: ["tentang", "profil", "struktur"], icon: InformationCircleIcon },
  { keywords: ["unduh", "download"], icon: ArrowDownTrayIcon },
  { keywords: ["integritas", "zona"], icon: ShieldCheckIcon },
  { keywords: ["pedagang", "pkl"], icon: UserGroupIcon },
  { keywords: ["pasar", "modern", "minimarket", "mall"], icon: ShoppingBagIcon },
  { keywords: ["industri", "ikm"], icon: PuzzlePieceIcon },
  { keywords: ["angkut", "distribusi", "truck"], icon: TruckIcon },
];

function getIcon(title = "") {
  const t = title.toLowerCase();
  for (const entry of iconMap) {
    if (entry.keywords.some((k) => t.includes(k))) return entry.icon;
  }
  return PuzzlePieceIcon;
}

function InstagramIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
      {...props}
    >
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.1" cy="6.9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Lightwidget({ id }) {
  useEffect(() => {
    if (!id) return;
    const src = `https://cdn.lightwidget.com/widgets/${id}.js`;
    if (document.querySelector(`script[data-lightwidget="${id}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.lightwidget = id;
    document.body.appendChild(script);
  }, [id]);

  return <div className="lightwidget-widget" style={{ width: "100%" }} />;
}

function HeroSlider({ banners }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef(null);

  const goTo = useCallback((i) => {
    setCurrent(i);
    clearInterval(timer.current);
    if (banners.length > 1) {
      timer.current = setInterval(() => {
        setCurrent((c) => (c + 1) % banners.length);
      }, 6000);
    }
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    timer.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer.current);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <section className="heroSlider">
        <div className="heroSlide">
          <div className="heroImageWrap">
            <img src={asset("images/project/Banner 1.png")} alt="DISPERDAGIN" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="heroSlider">
      <div className="heroTrack" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((b, i) => (
          <div className={`heroSlide ${i === current ? "active" : ""}`} key={b.id}>
            <div className="heroImageWrap">
              {b.link_url ? (
                <a href={b.link_url} target="_blank" rel="noreferrer">
                  <img src={asset(b.image)} alt={b.title || "Banner"} />
                </a>
              ) : (
                <img src={asset(b.image)} alt={b.title || "Banner"} />
              )}
            </div>
           
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
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [igFallback, setIgFallback] = useState({ provider: null, id: null });
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    apiGet("/api/site/services")
      .then((items) => setServices(items || []))
      .catch(() => setServices([]));
    apiGet("/api/site/banners")
      .then((items) => setBanners(items || []))
      .catch(() => setBanners([]));
    fetch("/api/site/instagram", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((res) => {
        setInstagramPosts(res.data || []);
        setIgFallback({
          provider: res.fallback_provider ?? null,
          id: res.fallback_embed_id ?? null,
        });
      })
      .catch(() => setInstagramPosts([]));
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setCurrentPost(null);
    }
    if (currentPost) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [currentPost]);

  return (
    <>
      <HeroSlider banners={banners} />

      <PriceWidget />

      <section className="section muted">
        <div className="sectionTitle">
          <span>Layanan</span>
          <h2>Layanan DISPERDAGIN Kota Kediri</h2>
          <p>
            Akses layanan perdagangan, perindustrian, informasi harga, dan
            penguatan usaha.
          </p>
        </div>

        <div className="serviceGrid">
          {services.length === 0 && <p className="blank">Belum ada layanan tersedia.</p>}
          {services.map((item) => {
            const Icon = getIcon(item.title);
            return (
              <a
                className="serviceCard"
                href={item.external_url || `/${item.slug}`}
                key={item.id || item.slug}
                target={item.external_url ? "_blank" : undefined}
                rel={item.external_url ? "noreferrer" : undefined}
              >
                <div className="serviceIcon">
                  <Icon />
                </div>
                <h3>{item.title}</h3>
                <p>{item.excerpt || item.content || "Informasi layanan DISPERDAGIN Kota Kediri."}</p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="sectionCta">
        <div className="ctaCard">
          <div className="ctaContent">
            <span>Survey Pelayanan</span>
            <h2>Bantu kami meningkatkan kualitas layanan</h2>
            <p>
              Isi survei kepuasan masyarakat secara singkat. Hasilnya tersimpan
              dan dapat ditampilkan real-time.
            </p>
          </div>
          <a className="btnCta" href="https://skm.go.id/share/instansi/e3a2df95-2de3-4b11-993d-9e37053593bd/1" target="_blank" rel="noreferrer">
            Isi Survei →
          </a>
        </div>
      </section>

      <section className="section instagramSection">
        <div className="sectionTitle">
          <span>Media Sosial</span>
          <h2>Follow kami di Instagram</h2>
          <p>
            Temukan info terbaru, kegiatan, dan pengumuman dari DISPERDAGIN Kota Kediri.
          </p>
        </div>

        <div className="instagramFeed">
          <div className="instagramGrid">
            {instagramPosts.length > 0 ? (
              instagramPosts.map((post) => (
                <button
                  type="button"
                  className="instagramGridItem"
                  key={post.id || post.shortcode}
                  onClick={() => setCurrentPost(post)}
                >
                  <img
                    src={post.thumbnail || post.image}
                    alt={post.caption ? post.caption.slice(0, 80) : "Instagram Post"}
                    loading="lazy"
                    className="instagramGridImg"
                  />
                  <div className="instagramOverlay">
                    <span className="instagramOverlayText">
                      {post.is_video ? "Tonton Video →" : "Lihat →"}
                    </span>
                  </div>
                </button>
              ))
            ) : igFallback.id ? (
              <div className="instagramFallback">
                {igFallback.provider === "snapwidget" ? (
                  <iframe
                    src={`https://snapwidget.com/embed/${igFallback.id}`}
                    className="snapwidget-widget"
                    title="Instagram DISPERDAGIN Kota Kediri"
                    allowTransparency="true"
                    frameBorder="0"
                    scrolling="no"
                    loading="lazy"
                  />
                ) : (
                  <Lightwidget id={igFallback.id} />
                )}
              </div>
            ) : (
              <div className="instagramProfileCard">
                <div className="instagramProfileAvatar">
                  <InstagramIcon />
                </div>
                <h3>@disperdagin_kotakediri</h3>
                <p>
                  Feed Instagram sedang tidak dapat dimuat. Ikuti kami di
                  Instagram untuk info terbaru, kegiatan, dan pengumuman
                  DISPERDAGIN Kota Kediri.
                </p>
                <a
                  className="instagramProfileBtn"
                  href="https://www.instagram.com/disperdagin_kotakediri"
                  target="_blank"
                  rel="noreferrer"
                >
                  <InstagramIcon />
                  Follow di Instagram
                </a>
              </div>
            )}
          </div>

          <div className="instagramFooter">
            <a
              href="https://www.instagram.com/disperdagin_kotakediri"
              target="_blank"
              rel="noreferrer"
              className="instagramLink"
            >
              <InstagramIcon />
              <span>@disperdagin_kotakediri</span>
            </a>
          </div>
        </div>
      </section>

      {currentPost && (
        <div
          className="igModalBackdrop"
          onClick={() => setCurrentPost(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="igModal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="igModalClose"
              onClick={() => setCurrentPost(null)}
              aria-label="Tutup"
            >
              &times;
            </button>
            <img
              className="igModalImg"
              src={currentPost.image || currentPost.thumbnail}
              alt={currentPost.caption ? currentPost.caption.slice(0, 80) : "Instagram Post"}
            />
            <div className="igModalBody">
              <a
                className="igModalProfile"
                href="https://www.instagram.com/disperdagin_kotakediri"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramIcon />
                <span>@disperdagin_kotakediri</span>
              </a>
              {currentPost.caption && (
                <p className="igModalCaption">{currentPost.caption}</p>
              )}
              <div className="igModalMeta">
                <span>♥ {currentPost.likes ?? 0}</span>
                <span>💬 {currentPost.comments ?? 0}</span>
              </div>
              <a
                className="igModalLink"
                href={currentPost.permalink || "https://www.instagram.com/disperdagin_kotakediri"}
                target="_blank"
                rel="noreferrer"
              >
                Buka di Instagram →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
