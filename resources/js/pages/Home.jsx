import { useEffect, useState } from "react";
import { asset, apiGet } from "../data/siteContent";
import PriceWidget from "./PriceWidget";

const serviceSlugs = [
  {
    title: "Bantuan Modal",
    desc: "Informasi bantuan modal dan penguatan usaha masyarakat.",
    href: "https://sultan.kedirikota.go.id/",
    external: true,
  },
  {
    slug: "layanan/halal",
    href: "/layanan/halal",
  },
  {
    slug: "layanan/merk",
    href: "/layanan/merk",
  },
  {
    slug: "layanan/sinas",
    href: "/layanan/sinas",
  },
  {
    slug: "layanan/tera",
    href: "/layanan/tera",
  },
  {
    slug: "layanan/td-gudang",
    href: "/layanan/td-gudang",
  },
  {
    slug: "layanan/minhol",
    href: "/layanan/minhol",
  },
];

export default function Home() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadServices() {
      const results = await Promise.all(
        serviceSlugs.map(async (item) => {
          if (item.external) return item;

          try {
            const page = await apiGet(`/api/site/page/${item.slug}`);

            return {
              title: page.title,
              desc:
                page.excerpt ||
                page.desc ||
                page.content ||
                "Informasi layanan DISPERDAGIN Kota Kediri.",
              href: item.href,
              image: page.image,
            };
          } catch (error) {
            return null;
          }
        }),
      );

      if (active) {
        setServices(results.filter(Boolean));
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <section className="heroSlider">
        {[
          "images/project/banner 6.png",
          "images/project/Banner 1.png",
          "images/project/Banner 2.png",
          "images/project/Banner 3.png",
        ].map((img) => (
          <img key={img} src={asset(img)} alt="Banner DISPERDAGIN" />
        ))}
      </section>

      <PriceWidget />

      <section className="section">
        <div className="sectionTitle">
          <span>Layanan</span>
          <h1>Layanan DISPERDAGIN Kota Kediri</h1>
          <p>
            Akses layanan perdagangan, perindustrian, informasi harga, dan
            penguatan usaha.
          </p>
        </div>

        <div className="serviceGrid">
          {services.map((item) => (
            <a
              className="serviceCard"
              href={item.href}
              key={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noreferrer" : undefined}
            >
              <div className="serviceIcon">
                {(item.title || "")
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="section surveyCta">
        <div>
          <span>Survey Pelayanan</span>
          <h2>Bantu kami meningkatkan kualitas layanan</h2>
          <p>
            Isi survey kepuasan masyarakat secara singkat. Hasilnya tersimpan
            melalui API Laravel dan dapat ditampilkan real-time.
          </p>
        </div>

        <a className="btn" href="/survey">
          Isi Survey
        </a>
      </section>
    </>
  );
}
