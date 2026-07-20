import { useEffect, useMemo, useState } from "react";
import { asset, apiGet } from "../data/siteContent";
import XMarkIcon from "@heroicons/react/24/outline/XMarkIcon";

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

function PasarModal({ market, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const hasCoords = market.latitude && market.longitude;
  const mapSrc = hasCoords
    ? `https://www.google.com/maps/embed/v1/place?key=&q=${market.latitude},${market.longitude}&center=${market.latitude},${market.longitude}&zoom=15`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.482145629552!2d112.0164!3d-7.8169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785b7e2e7b6c8d%3A0x8f0e5c5f5b5e5a5f!2sKota%20Kediri!5e0!3m2!1sid!2sid!4v1`;

  return (
    <div className="pasarModalOverlay" onClick={onClose}>
      <div className="pasarModal" onClick={(e) => e.stopPropagation()}>
        <button className="pasarModalClose" onClick={onClose}>
          <XMarkIcon />
        </button>
        <div className="pasarModalContent">
          <h2>{market.name}</h2>
          <span className="pasarModalBadge">{market.category}</span>
          {market.address && <p className="pasarModalAddress">{market.address}</p>}
          <div className="pasarModalMap">
            <iframe
              title={`Peta ${market.name}`}
              src={mapSrc}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getBrand(name) {
  return (name || "").split(" ")[0];
}

const categoryLabels = {
  Minimarket: "Minimarket",
  Supermarket: "Supermarket",
  "Department Store": "Department Store",
  Hypermarket: "Hypermarket",
  "Pusat Perbelanjaan": "Pusat Perbelanjaan",
};

export default function PasarModernPage() {
  const [page, setPage] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [filter, setFilter] = useState("Semua");
  const [subFilter, setSubFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const logo = "images/d1.png";

  useEffect(() => {
    let active = true;
    apiGet("/api/site/pasar-modern")
      .then((data) => {
        if (active) {
          setPage(data);
          setMarkets(data.markets || []);
        }
      })
      .catch(() => {
        if (active) setPage(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = ["Semua", ...new Set(markets.map((m) => m.category))];

  const brands = useMemo(() => {
    const minimarkets = markets.filter((m) => m.category === "Minimarket");
    return ["Semua", ...new Set(minimarkets.map((m) => getBrand(m.name)))];
  }, [markets]);

  const handleFilterChange = (cat) => {
    setFilter(cat);
    setSubFilter("Semua");
  };

  const filtered = useMemo(() => {
    let result = filter === "Semua" ? markets : markets.filter((m) => m.category === filter);
    if (filter === "Minimarket" && subFilter !== "Semua") {
      result = result.filter((m) => getBrand(m.name) === subFilter);
    }
    return result;
  }, [markets, filter, subFilter]);

  if (loading) return <Loading />;
  if (!page) return <Loading />;

  return (
    <>
      <section className="tentangHero">
        <div className="tentangHeroContent">
          <span>{page.eyebrow || "Informasi"}</span>
          <h1>{page.title || "Pasar Modern"}</h1>
        </div>
      </section>

      <section className="section">
        <div className="tentangLogo">
          <img src={asset(logo)} alt="DISPERDAGIN Kota Kediri" />
        </div>

        <div className="pasarFilter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={filter === cat ? "active" : ""}
              onClick={() => handleFilterChange(cat)}
            >
              {cat === "Semua" ? "Semua" : (categoryLabels[cat] || cat)}
            </button>
          ))}
        </div>

        {filter === "Minimarket" && brands.length > 1 && (
          <div className="pasarSubFilter">
            {brands.map((brand) => (
              <button
                key={brand}
                className={subFilter === brand ? "active" : ""}
                onClick={() => setSubFilter(brand)}
              >
                {brand === "Semua" ? "Semua" : brand}
              </button>
            ))}
          </div>
        )}

        <div className="pasarGrid">
          {filtered.map((market) => (
            <div
              key={market.id}
              className="pasarCard"
              onClick={() => setSelected(market)}
            >
              <div className="pasarCardImage">
                {market.image ? (
                  <img
                    src={asset(market.image)}
                    alt={market.name}
                    onError={(e) => {
                      e.currentTarget.src = asset("images/office.png");
                    }}
                  />
                ) : (
                  <div className="pasarCardPlaceholder">
                    <span>{getBrand(market.name).charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="pasarCardInfo">
                <h3>{market.name}</h3>
                <p>{market.address ? market.address.split(",")[0] : (categoryLabels[market.category] || market.category)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <PasarModal
          market={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
