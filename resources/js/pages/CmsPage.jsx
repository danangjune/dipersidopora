import { useEffect, useState } from "react";
import { apiGet, asset, normalizePath } from "../data/siteContent";

const downloadMap = {
  "/unduhan/renstra": {
    title: "Rencana Strategis",
    category: "renstra",
  },
  "/unduhan/renja": {
    title: "Rencana Kerja",
    category: "renja",
  },
  "/unduhan/laporan": {
    title: "Laporan",
    category: "laporan",
  },
};

function Loading() {
  return (
    <section className="section">
      <p>Memuat halaman...</p>
    </section>
  );
}

function NotFound() {
  return (
    <section className="section">
      <div className="sectionTitle">
        <span>CMS</span>
        <h1>Halaman belum tersedia</h1>
        <p>Konten belum dipublish di CMS admin.</p>
        <a className="btn" href="/admin/pages">
          Buka Admin
        </a>
      </div>
    </section>
  );
}

function DownloadPage({ title, items }) {
  return (
    <section className="section">
      <div className="sectionTitle">
        <span>Unduhan</span>
        <h1>{title}</h1>
        <p>Dokumen ini diambil dari database melalui CMS admin.</p>
      </div>

      <div className="downloadList">
        {items.length === 0 ? (
          <p>Belum ada dokumen.</p>
        ) : (
          items.map((item) => (
            <a
              key={item.id}
              href={asset(item.file_path)}
              target="_blank"
              rel="noreferrer"
            >
              <strong>{item.title}</strong>
              <span>Download PDF</span>
            </a>
          ))
        )}
      </div>
    </section>
  );
}

function CmsNormalPage({ page }) {
  const paragraphs = (page.content || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <section className="section pageHero">
      <div className="pageCopy">
        <span>{page.eyebrow || page.group || "DISPERDAGIN"}</span>
        <h1>{page.title}</h1>

        {/* {page.excerpt && <p>{page.excerpt}</p>} */}

        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {page.image && (
        <img
          src={asset(page.image)}
          alt={page.title}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}

      {Array.isArray(page.cards) && page.cards.length > 0 && (
        <div className="infoCards">
          {page.cards.map((card, index) => (
            <div key={index}>
              <h3>{card.title || card[0]}</h3>
              <p>{card.text || card[1]}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function CmsPage({ path }) {
  const normalizedPath = normalizePath(path || window.location.pathname);
  const [page, setPage] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMissing(false);

      try {
        const downloadConfig = downloadMap[normalizedPath];

        if (downloadConfig) {
          const items = await apiGet(
            `/api/site/downloads/${downloadConfig.category}`,
          );

          if (!active) return;

          setDownloads(items || []);
          setPage({
            type: "download",
            title: downloadConfig.title,
          });

          return;
        }

        const slug = normalizedPath.replace(/^\//, "");
        const result = await apiGet(`/api/site/page/${slug}`);

        if (!active) return;

        setPage(result);
      } catch (error) {
        if (!active) return;
        setMissing(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [normalizedPath]);

  if (loading) return <Loading />;
  if (missing || !page) return <NotFound />;

  if (page.type === "download") {
    return <DownloadPage title={page.title} items={downloads} />;
  }

  return <CmsNormalPage page={page} />;
}
