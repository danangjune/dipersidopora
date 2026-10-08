import { useEffect, useMemo, useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  BuildingOffice2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  EyeIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { asset } from "../data/siteContent";

const imageUrl = (path) => path ? asset(path) : "";
const companyKey = (value) => (value || "").trim().toLocaleLowerCase("id-ID");
const productImages = (product) => {
  const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
  return images.length > 0 ? images.slice(0, 5) : (product.product_image ? [product.product_image] : []);
};

function ImageFallback({ src, alt, className, logo = false }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${className} pameranImageFallback`} aria-label={alt}>
      {logo ? <BuildingOffice2Icon /> : <Squares2X2Icon />}
    </div>;
  }
  return <img className={className} src={imageUrl(src)} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}

function ProductSlider({ product, modal = false }) {
  const images = productImages(product);
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [product.id]);
  const move = (direction, event) => {
    event?.stopPropagation();
    setActive(current => (current + direction + images.length) % images.length);
  };

  return <div className={modal ? "pameranModalHero" : "pameranCardMedia"}>
    <ImageFallback className={modal ? "pameranModalImage" : "pameranProductImage"} src={images[active]} alt={`${product.name} - foto ${active + 1}`} />
    {images.length > 1 && <>
      <button className="pameranSlideArrow prev" type="button" aria-label="Foto sebelumnya" onClick={(event) => move(-1, event)}><ChevronLeftIcon /></button>
      <button className="pameranSlideArrow next" type="button" aria-label="Foto berikutnya" onClick={(event) => move(1, event)}><ChevronRightIcon /></button>
      <div className="pameranSlideDots">
        {images.map((_, index) => <button key={index} className={index === active ? "active" : ""} type="button" aria-label={`Lihat foto ${index + 1}`} onClick={(event) => { event.stopPropagation(); setActive(index); }} />)}
      </div>
    </>}
    {!modal && <><div className="pameranCardShine" /><span className="pameranViewLabel">Lihat detail <span>↗</span></span></>}
  </div>;
}

function ProductCard({ product, onClick, compact = false }) {
  return <article className={`pameranCard${compact ? " compact" : ""}`} onClick={() => onClick(product)} onKeyDown={(event) => event.key === "Enter" && onClick(product)} role="button" tabIndex="0">
    <ProductSlider product={product} />
    <div className="pameranCardBody">
      <div className="pameranCompanyLine">
        <ImageFallback className="pameranLogo" src={product.logo} alt={`Logo ${product.company}`} logo />
        <span>{product.company}</span>
      </div>
      <h2>{product.name}</h2>
      {!compact && <div className="pameranCardFooter"><MapPinIcon /><span>{product.address || "Kota Kediri"}</span></div>}
    </div>
  </article>;
}

function ProductModal({ product, products, onClose, onSelect }) {
  const related = products.filter(item => item.id !== product.id && companyKey(item.company) === companyKey(product.company));
  const [showDocument, setShowDocument] = useState(false);

  useEffect(() => setShowDocument(false), [product.id]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return <div className="pameranModalBackdrop" onMouseDown={onClose} role="presentation">
    <div className="pameranModal" role="dialog" aria-modal="true" aria-labelledby="pameran-detail-title" onMouseDown={event => event.stopPropagation()}>
      <button className="pameranModalClose" onClick={onClose} type="button" aria-label="Tutup detail"><XMarkIcon /></button>
      <ProductSlider product={product} modal />
      <div className="pameranModalContent">
        <div className="pameranModalCompany">
          <ImageFallback className="pameranModalLogo" src={product.logo} alt={`Logo ${product.company}`} logo />
          <div><span>Dipersembahkan oleh</span><strong>{product.company}</strong></div>
        </div>
        <h2 id="pameran-detail-title">{product.name}</h2>
        <div className="pameranDetails">
          {product.phone && <a href={`tel:${product.phone}`}><PhoneIcon /><span><small>No. HP</small>{product.phone}</span></a>}
          {product.website && <a href={product.website} target="_blank" rel="noreferrer"><ArrowTopRightOnSquareIcon /><span><small>Website</small>{product.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span></a>}
          {product.address && <div><MapPinIcon /><span><small>Alamat</small>{product.address}</span></div>}
        </div>

        {product.detail_pdf && <section className="pameranDocument">
          <button type="button" onClick={() => setShowDocument(value => !value)}>
            <DocumentTextIcon />
            <span><small>Dokumen produk</small><strong>{showDocument ? "Tutup preview PDF" : "Preview detail PDF"}</strong></span>
            <EyeIcon />
          </button>
          {showDocument && <div className="pameranPdfViewer">
            <iframe src={`${imageUrl(product.detail_pdf)}#toolbar=0&navpanes=0`} title={`Dokumen detail ${product.name}`} />
          </div>}
        </section>}

        {related.length > 0 && <section className="pameranRelated">
          <div className="pameranRelatedHead"><span>Produk terkait</span><small>{related.length} produk lain dari perusahaan ini</small></div>
          <div className="pameranRelatedGrid">
            {related.map(item => <ProductCard key={item.id} product={item} compact onClick={onSelect} />)}
          </div>
        </section>}
      </div>
    </div>
  </div>;
}

export default function PameranPage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/site/pameran", { headers: { Accept: "application/json" } })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(result => setProducts(result.data || []))
      .catch(() => setError("Katalog belum dapat dimuat. Silakan coba kembali."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("id-ID");
    if (!keyword) return products;
    return products.filter(item => [item.name, item.company, item.address].some(value => (value || "").toLocaleLowerCase("id-ID").includes(keyword)));
  }, [products, query]);

  return <div className="pameranPage">
    <section className="pameranHero">
      <div className="pameranOrb pameranOrbOne" /><div className="pameranOrb pameranOrbTwo" />
      <div className="pameranHeroContent">
        <span className="pameranEyebrow"><Squares2X2Icon /> Etalase produk unggulan</span>
        <h1>Pameran Produk<br /><em>Kota Kediri</em></h1>
        <p>Temukan produk lokal pilihan dan terhubung langsung dengan perusahaan serta pelaku usaha terbaik di Kota Kediri.</p>
      </div>
    </section>

    <section className="pameranCatalog">
      <div className="pameranCatalogHead">
        <div><span>Katalog pameran</span><h2>Jelajahi produk pilihan</h2><p>{products.length} produk dari pelaku usaha lokal</p></div>
        <label className="pameranSearch"><MagnifyingGlassIcon /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari produk atau perusahaan..." /></label>
      </div>
      {loading && <div className="pameranState"><span className="pameranLoader" />Memuat katalog...</div>}
      {error && <div className="pameranState error">{error}</div>}
      {!loading && !error && filtered.length === 0 && <div className="pameranEmpty"><MagnifyingGlassIcon /><h3>Produk tidak ditemukan</h3><p>Coba gunakan kata kunci yang berbeda.</p></div>}
      {!loading && filtered.length > 0 && <div className="pameranGrid">{filtered.map(product => <ProductCard key={product.id} product={product} onClick={setSelected} />)}</div>}
    </section>
    {selected && <ProductModal product={selected} products={products} onClose={() => setSelected(null)} onSelect={setSelected} />}
  </div>;
}
