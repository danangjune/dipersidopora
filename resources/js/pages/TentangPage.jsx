import { asset } from "../data/siteContent";
import BuildingOffice2Icon from "@heroicons/react/24/outline/BuildingOffice2Icon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon";
import PhoneIcon from "@heroicons/react/24/outline/PhoneIcon";
import GlobeAltIcon from "@heroicons/react/24/outline/GlobeAltIcon";
import CameraIcon from "@heroicons/react/24/outline/CameraIcon";


const bidang = [
  {
    icon: BuildingOffice2Icon,
    title: "Perdagangan",
    desc: "Merencanakan, melaksanakan, mengkoordinasikan dan mengendalikan kebijakan pengembangan perdagangan dalam dan luar negeri, kebijakan stabilisasi harga barang dan rekomendasi perizinan usaha.",
  },
  {
    icon: CameraIcon,
    title: "Perindustrian",
    desc: "Merencanakan, melaksanakan, mengkoordinasikan dan mengendalikan kebijakan perencanaan dan pembangunan industri, pengendalian usaha izin usaha industri, dan pengelolaan sistem informasi industri nasional.",
  },
  {
    icon: GlobeAltIcon,
    title: "Kemetrologian",
    desc: "Merencanakan, melaksanakan, mengkoordinasikan dan mengendalikan kebijakan standardisasi dan perlindungan konsumen.",
  },
];

const alamatList = [
  {
    title: "Kantor DISPERDAGIN Kota Kediri",
    address: "Jl. Penanggungan No. 7, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114",
  },
  {
    title: "Unit Metrologi Legal",
    address: "Jl. Penanggungan No. 45, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114",
  },
  {
    title: "Unit Metrologi Tangki Ukur Mobil (TUM)",
    address: "Jl. Sudanco Supriadi No.3, Mojoroto, Kec. Mojoroto, Kota Kediri, Jawa Timur 64114",
  },
];

const kontak = [
  { icon: EnvelopeIcon, label: "Email", value: "disperdagin@kedirikota.go.id", href: "mailto:disperdagin@kedirikota.go.id" },
  { icon: PhoneIcon, label: "Phone", value: "0354771908", href: "tel:0354771908" },
  { icon: CameraIcon, label: "Instagram", value: "@disperdagin_kotakediri", href: "https://www.instagram.com/disperdagin_kotakediri" },
  { icon: CameraIcon, label: "Youtube", value: "DISPERDAGIN Kota Kediri", href: "https://www.youtube.com/@disperdaginkotakediri7304" },
  { icon: GlobeAltIcon, label: "Website", value: "disperdagin.kedirikota.go.id", href: "https://disperdagin.kedirikota.go.id" },
];

export default function TentangPage() {
  return (
    <>
      <section className="tentangHero">
        <div className="tentangHeroContent">
          <span>Profil</span>
          <h1>DISPERDAGIN Kota Kediri</h1>
        </div>
      </section>

      <section className="section">
        <div className="tentangLogo">
          <img src={asset("images/d1.png")} alt="DISPERDAGIN Kota Kediri" />
        </div>

        <div className="tentangKadin">
          <div className="tentangKadinFoto">
            <img src={asset("images/ft1.png")} alt="Kepala Dinas" />
          </div>
          <div className="tentangKadinInfo">
            <h3>Kepala Dinas</h3>
            <h2>WAHYU KUSUMA WARDANI, SSTP.MM</h2>
            <div className="tentangDivider" />
            <div className="tentangDesc">
              <h4>Profil Dinas</h4>
              <p>
                Dinas Perdagangan dan Perindustrian Kota Kediri adalah salah satu bagian penting dari Pemerintah Kota Kediri yang memiliki peran vital dalam mengelola dan mengembangkan sektor perdagangan dan perindustrian. Mulai dari merancang kebijakan pembangunan yang inovatif, mengawasi dan mengatur izin usaha industri, hingga mengelola sistem informasi industri nasional, dilakukan dengan tujuan untuk mendorong pertumbuhan ekonomi dan memastikan perkembangan industri yang berkelanjutan.
              </p>
              <p>
                Dinas Perdagangan dan Perindustrian Kota Kediri berkomitmen untuk menciptakan lingkungan usaha yang kondusif dan mendukung kemajuan industri lokal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="sectionTitle">
          <span>Bidang</span>
          <h2>Bidang DISPERDAGIN</h2>
          <p>
            Dinas Perdagangan dan Perindustrian Kota Kediri memiliki 3 bidang utama dalam menjalankan tugas dan fungsinya.
          </p>
        </div>
        <div className="tentangBidangGrid">
          {bidang.map((b) => (
            <div key={b.title} className="tentangBidangCard">
              <div className="tentangBidangIcon">
                <b.icon />
              </div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="tentangAlamatGrid">
          <div>
            <div className="sectionTitle" style={{ textAlign: "left", margin: "0 0 28px" }}>
              <span>Alamat</span>
              <h2>Alamat Kantor</h2>
            </div>
            <div className="tentangAlamatList">
              {alamatList.map((a) => (
                <div key={a.title} className="tentangAlamatItem">
                  <MapPinIcon />
                  <div>
                    <strong>{a.title}</strong>
                    <p>{a.address}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="tentangMap">
            <iframe
              title="Peta Lokasi DISPERDAGIN Kota Kediri"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.482145629552!2d112.0164!3d-7.8169!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e785b7e2e7b6c8d%3A0x8f0e5c5f5b5e5a5f!2sJl.%20Penanggungan%20No.7%2C%20Bandar%20Lor%2C%20Kec.%20Mojoroto%2C%20Kota%20Kediri%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section className="section muted">
        <div className="sectionTitle">
          <span>Kontak</span>
          <h2>Kontak Kami</h2>
        </div>
        <div className="tentangKontakGrid">
          {kontak.map((k) => (
            <a key={k.label} href={k.href} className="tentangKontakCard" target={k.href.startsWith("http") ? "_blank" : undefined} rel={k.href.startsWith("http") ? "noreferrer" : undefined}>
              <div className="tentangKontakIcon">
                <k.icon />
              </div>
              <div>
                <strong>{k.label}</strong>
                <span>{k.value}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
