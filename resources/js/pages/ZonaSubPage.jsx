import { asset } from "../data/siteContent";
import FlagIcon from "@heroicons/react/24/outline/FlagIcon";
import ChartBarIcon from "@heroicons/react/24/outline/ChartBarIcon";
import CheckBadgeIcon from "@heroicons/react/24/outline/CheckBadgeIcon";
import ArrowTrendingUpIcon from "@heroicons/react/24/outline/ArrowTrendingUpIcon";

const pages = {
  "mnj-perubahan": {
    title: "Manajemen Perubahan",
    image: "images/mnj-perubahan.webp",
    intro: "Untuk membangun unit yang berintegritas dan berkualitas pelayanan prima diperlukan adanya manajemen perubahan untuk memastikan perubahan yang dilakukan dapat berjalan sesuai tujuan perubahan.",
    tujuan: "Mentransformasi sistem dan mekanisme kerja organisasi serta mindset (pola pikir) dan culturereset (cara kerja) individu ASN menjadi adaptif, inovatif, responsive, profesional dan berintegritas sehingga dapat memenuhi tuntutan perkembangan zaman dan kebutuhan masyarakat yang semakin meningkat.",
    targets: [
      "Terjadinya perubahan pola pikir dan budaya kerja",
      "Menurunnya resiko kegagalan yang disebabkan kemungkinan timbulnya resistensi terhadap perubahan",
      "Terimplementasinya core value ASN Berakhlak (berorientasi pelayanan, akuntabel, kompeten, harmonis, loyal, adaptif dan kolaboratif)",
    ],
    aspekPemenuhan: [
      "Penyusunan tim kerja",
      "Rencana pembangunan Zona Integritas",
      "Pemantauan dan evaluasi pembangunan",
      "Perubahan pola pikir dan budaya kerja",
    ],
    aspekReform: [
      "Komitmen dalam perubahan",
      "Komitmen pimpinan",
      "Membangun budaya kerja",
    ],
  },
  "tata-laksana": {
    title: "Penataan Tata Laksana",
    image: "images/tata-laksana.webp",
    intro: "Untuk membangun unit pelayanan yang berintegritas dan mampu memberikan kualitas layanan yang prima, diperlukan adanya penataan tata laksana yang mendorong efisiensi dan mempercepat proses pelaksanaan tugas dan fungsi unit pelayanan.",
    tujuan: "Meningkatkan efisiensi dan efektivitas sistem, proses, dan prosedur kerja yang jelas, efektif, efisien dan terukur pada zona integritas menuju WBK/WBBM.",
    targets: [
      "Meningkatkan penggunaan teknologi informasi dalam proses penyelenggaraan manajemen pemerintahan",
      "Meningkatnya efisiensi dan efektivitas manajemen pemerintahan",
      "Meningkatnya kinerja unit kerja atau satuan kerja",
    ],
    aspekPemenuhan: [
      "SOP Kegiatan",
      "SPBE",
      "Keterbukaan informasi publik",
    ],
    aspekReform: [
      "Peta probis mempengaruhi",
      "SPBE",
      "Transformasi digital memberikan nilai manfaat",
    ],
  },
  "mnj-sdm": {
    title: "Penataan Manajemen Sumber Daya Manusia",
    image: "images/mnj-sdm.webp",
    intro: "Untuk membangun unit pelayanan yang berintegritas dan mampu memberikan kualitas pelayanan prima, diperlukan adanya manajemen SDM disesuaikan dengan kebutuhan unit pelayanan dalam menghasilkan pelayanan yang berkualitas.",
    tujuan: "Meningkatnya profesionalisme pada zona integritas menuju WBK/WBBM.",
    targets: [
      "Meningkatnya ketaatan terhadap pengelolaan SDM aparatur",
      "Meningkatnya transparasi dan akuntabilitas pengelolaan SDM aparatur",
      "Meningkatnya disiplin aparatur",
      "Meningkatnya efektivitas manajemen SDM aparatur",
      "Meningkatnya profesionalisme SDM",
    ],
    aspekPemenuhan: [
      "Perencanaan kebutuhan pegawai sesuai dengan kebutuhan organisasi",
      "Pola mutasi internal",
      "Pengembangan pegawai berbasis kompetensi",
      "Penetapan kinerja individu",
      "Penetapan aturan disiplin/kode etik",
      "Sistem informasi kepegawaian",
    ],
    aspekReform: [
      "Kinerja individu",
      "Assessment kepegawaian",
      "Pelanggaran disiplin pegawai",
    ],
  },
  akuntabilitas: {
    title: "Penguatan Akuntabilitas",
    image: "images/akuntabilitas.webp",
    intro: "Untuk membangun unit pelayanan yang berintegritas dan mampu memberikan kualitas pelayanan prima, diperlukan adanya manajemen kinerja yang memberikan arahan tentang pengelolaan pelayanan untuk mencapai hasil yang diharapkan oleh instansi.",
    tujuan: "Meningkatkan kapasitas dan akuntabilitas kinerja instansi pemerintah.",
    targets: [
      "Meningkatnya kinerja instansi pemerintah",
      "Meningkatnya akuntabilitas instansi pemerintah",
    ],
    aspekPemenuhan: [
      "Keterlibatan pimpinan",
      "Pengelolaan akuntabilitas kinerja",
    ],
    aspekReform: [
      "Meningkatnya capaian kinerja unit kerja",
      "Pemberian reward dan punishment",
    ],
  },
  pengawasan: {
    title: "Penguatan Pengawasan",
    image: "images/pengawasan.webp",
    intro: "Untuk membangun unit pelayanan yang berintegritas dan mampu memberikan kualitas pelayanan prima, diperlukan adanya sistem pengendalian internal untuk memastikan integritas pelayanan.",
    tujuan: "Meningkatkan penyelenggaraan pemerintahan yang bersih dan bebas KKN pada masing-masing instansi.",
    targets: [
      "Meningkatnya kepatuhan terhadap pengelolaan keuangan negara oleh masing-masing instansi pemerintah",
      "Menurunnya tingkat penyalahgunaan wewenang pada unit kerja",
      "Meningkatnya sistem integritas di unit kerja dalam upaya pencegahan KKN",
    ],
    aspekPemenuhan: [
      "Pengendalian gratifikasi",
      "Penetapan SPIP",
      "Pengaduan masyarakat",
      "Wistle-blowing system",
      "Penanganan benturan kepentingan",
    ],
    aspekReform: [
      "Mekanisme pengendalian",
      "Penanganan pengaduan masyarakat",
      "Penyampaian laporan harta kekayaan",
    ],
  },
  "pelayanan-publik": {
    title: "Peningkatan Kualitas Pelayanan Publik",
    image: "images/pelayanan-publik.webp",
    intro: "Untuk membangun unit pelayanan yang berintegritas dan mampu memberikan kualitas pelayanan prima, diperlukan adanya manajemen pelayanan untuk memastikan pelayanan yang diberikan sesuai dengan aturan.",
    tujuan:
      "Meningkatkan kualitas dan inovasi pelayanan publik pada masing-masing instansi pemerintah secara berkala sesuai dengan kebutuhan dan harapan masyarakat. Membangun kepercayaan masyarakat terhadap penyelenggara pelayanaan publik dalam rangka peningkatan kesejahteraan masyarakat sebagai sarana untuk perbaikan pelayanan publik.",
    targets: [
      "Meningkatnya kualitas pelayanan publik (lebih cepat, lebih murah, lebih aman dan lebih mudah dijangkau) pada instansi pemerintah",
      "Meningkatnya jumlah unit pelayanan yang memperoleh standartisasi pelayanan nasional atau internasional pada instansi pemerintah",
      "Meningkatnya indeks kepuasan masyarakat terhadap penyelenggara pelayanan publik oleh instansi pemerintah",
    ],
    aspekPemenuhan: [
      "Standart pelayanan",
      "Budaya pelayanan prima",
      "Pengelolaan pengaduan",
      "Penilaian kepuasan terhadap pelayanan",
      "Pemanfaatan teknologi informasi",
    ],
    aspekReform: [
      "Upaya atau inovasi pelayanan publik",
      "Penanganan pengaduan pelayanan",
    ],
  },
};

export default function ZonaSubPage({ slug }) {
  const page = pages[slug];
  if (!page) return null;

  return (
    <>
      <section className="ziSubHero">
        <div className="ziSubHeroBg" />
        <div className="ziSubHeroContent">
          <span className="ziHeroBadge">Zona Integritas</span>
          <h1 className="ziSubHeroTitle">{page.title}</h1>
        </div>
      </section>

      <section className="section">
        <div className="ziSubIntro">
          <div className="ziSubIntroImg">
            <img src={asset(page.image)} alt={page.title} />
          </div>
          <div className="ziSubIntroText">
            <p>{page.intro}</p>
          </div>
        </div>

        <div className="ziSubGrid">
          <div className="ziSubCard">
            <div className="ziSubCardHead">
              <span className="ziSubIconWrap ziIconTujuan"><FlagIcon className="ziSubIcon" /></span>
              <h3>Tujuan</h3>
            </div>
            <p>{page.tujuan}</p>
          </div>

          <div className="ziSubCard">
            <div className="ziSubCardHead">
              <span className="ziSubIconWrap ziIconTarget"><ChartBarIcon className="ziSubIcon" /></span>
              <h3>Target Yang Ingin Dicapai</h3>
            </div>
            <ul className="ziSubList">
              {page.targets.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ziSubGrid">
          <div className="ziSubCard">
            <div className="ziSubCardHead">
              <span className="ziSubIconWrap ziIconPemenuhan"><CheckBadgeIcon className="ziSubIcon" /></span>
              <h3>Aspek Pemenuhan <span className="ziSubBadge">5%</span></h3>
            </div>
            <ul className="ziSubList">
              {page.aspekPemenuhan.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          <div className="ziSubCard">
            <div className="ziSubCardHead">
              <span className="ziSubIconWrap ziIconReform"><ArrowTrendingUpIcon className="ziSubIcon" /></span>
              <h3>Aspek Reform <span className="ziSubBadge">5%</span></h3>
            </div>
            <ul className="ziSubList">
              {page.aspekReform.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
