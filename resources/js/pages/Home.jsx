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
              Isi survey kepuasan masyarakat secara singkat. Hasilnya tersimpan
              dan dapat ditampilkan real-time.
            </p>
          </div>
          <a className="btnCta" href="/survey">
            Isi Survey →
          </a>
        </div>
      </section>
    </>
  );
}
