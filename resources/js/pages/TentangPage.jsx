import { useEffect, useState } from "react";
import { asset, apiGet } from "../data/siteContent";
import BuildingOffice2Icon from "@heroicons/react/24/outline/BuildingOffice2Icon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon";
import PhoneIcon from "@heroicons/react/24/outline/PhoneIcon";
import GlobeAltIcon from "@heroicons/react/24/outline/GlobeAltIcon";
import CameraIcon from "@heroicons/react/24/outline/CameraIcon";

const iconMap = {
  BuildingOffice2Icon: BuildingOffice2Icon,
  CameraIcon: CameraIcon,
  GlobeAltIcon: GlobeAltIcon,
  EnvelopeIcon: EnvelopeIcon,
  PhoneIcon: PhoneIcon,
  MapPinIcon: MapPinIcon,
  default: BuildingOffice2Icon,
};

function TentangPageLoaded({ page, tentangData }) {
  const {
    logo = "",
    kadin = {},
    bidang = [],
    alamat = [],
    kontak = [],
    maps_embed = "",
  } = tentangData;

  const kadinPhoto = kadin.photo || page.image || "";
  const kadinName = kadin.name || "";
  const kadinTitle = kadin.title || "";
  const kadinDesc = kadin.description || "";

  return (
    <>
      <section className="tentangHero">
        <div className="tentangHeroContent">
          <span>{page.eyebrow || "Profil"}</span>
          <h1>{page.title || "DISPERDAGIN Kota Kediri"}</h1>
        </div>
      </section>

      <section className="section">
        {logo && (
          <div className="tentangLogo">
            <img src={asset(logo)} alt="Logo DISPERDAGIN" />
          </div>
        )}

        <div className="tentangKadin">
          {kadinPhoto && (
            <div className="tentangKadinFoto">
              <img src={asset(kadinPhoto)} alt={kadinName || "Kepala Dinas"} />
            </div>
          )}
          <div className="tentangKadinInfo">
            {kadinTitle && <h3>{kadinTitle}</h3>}
            {kadinName && <h2>{kadinName}</h2>}
            <div className="tentangDivider" />
            <div className="tentangDesc">
              {kadinDesc && (
                kadinDesc.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {bidang.length > 0 && (
        <section className="section muted">
          <div className="sectionTitle">
            <span>Bidang</span>
            <h2>Bidang DISPERDAGIN</h2>
            <p>
              Dinas Perdagangan dan Perindustrian Kota Kediri memiliki {bidang.length} bidang utama dalam menjalankan tugas dan fungsinya.
            </p>
          </div>
          <div className="tentangBidangGrid">
            {bidang.map((b, i) => {
              const Icon = iconMap[b.icon] || iconMap.default;
              return (
                <div key={i} className="tentangBidangCard">
                  <div className="tentangBidangIcon">
                    <Icon />
                  </div>
                  <h3>{b.title}</h3>
                  <p>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {alamat.length > 0 && (
        <section className="section">
          <div className="tentangAlamatGrid">
            <div>
              <div className="sectionTitle" style={{ textAlign: "left", margin: "0 0 28px" }}>
                <span>Alamat</span>
                <h2>Alamat Kantor</h2>
              </div>
              <div className="tentangAlamatList">
                {alamat.map((a, i) => (
                  <div key={i} className="tentangAlamatItem">
                    <MapPinIcon />
                    <div>
                      <strong>{a.title}</strong>
                      <p>{a.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {maps_embed && (
              <div className="tentangMap">
                <iframe
                  title="Peta Lokasi DISPERDAGIN Kota Kediri"
                  src={maps_embed}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {kontak.length > 0 && (
        <section className="section muted">
          <div className="sectionTitle">
            <span>Kontak</span>
            <h2>Kontak Kami</h2>
          </div>
          <div className="tentangKontakGrid">
            {kontak.map((k, i) => {
              const Icon = iconMap[k.icon] || iconMap.default;
              return (
                <a
                  key={i}
                  href={k.href || "#"}
                  className="tentangKontakCard"
                  target={k.href && k.href.startsWith("http") ? "_blank" : undefined}
                  rel={k.href && k.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  <div className="tentangKontakIcon">
                    <Icon />
                  </div>
                  <div>
                    <strong>{k.label}</strong>
                    <span>{k.value}</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
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

export default function TentangPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGet("/api/site/tentang")
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
    <TentangPageLoaded
      page={page}
      tentangData={page.tentang_data || {}}
    />
  );
}
