import { asset, services } from '../data/siteContent';
import PriceWidget from './PriceWidget';

export default function Home() {
  return <>
    <section className="heroSlider">
      {['images/project/banner 6.png','images/project/Banner 1.png','images/project/Banner 2.png','images/project/Banner 3.png'].map(img => <img key={img} src={asset(img)} alt="Banner DISPERDAGIN" />)}
    </section>

    <section className="section muted">
      <div className="sectionTitle"><span>Layanan</span><h1>Layanan DISPERDAGIN Kota Kediri</h1><p>Akses layanan perdagangan, perindustrian, informasi harga, dan penguatan usaha.</p></div>
      <div className="serviceGrid">
        {services.map(item => <a className="serviceCard" href={item.href} key={item.title} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
          <div className="serviceIcon">{item.title.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
          <h3>{item.title}</h3><p>{item.desc}</p>
        </a>)}
      </div>
    </section>

    <PriceWidget />

    <section className="section ctaSection">
      <div><span>Survey Pelayanan</span><h2>Bantu kami meningkatkan kualitas layanan</h2><p>Isi survey kepuasan masyarakat secara singkat. Hasilnya tersimpan melalui API Laravel dan dapat ditampilkan real-time.</p></div>
      <a className="btn" href="/survey">Isi Survey</a>
    </section>
  </>;
}
