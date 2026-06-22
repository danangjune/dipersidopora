import { asset, staticPages, servicePages, downloads, routeAliases } from '../data/siteContent';
import CmsPage from './CmsPage';

export function StaticPage({ page }) {
  return <section className="section pageHero">
    <div className="pageCopy"><span>{page.eyebrow || 'DISPERDAGIN'}</span><h1>{page.title}</h1>{page.body?.map((p, i) => <p key={i}>{p}</p>)}</div>
    {page.image && <img src={asset(page.image)} alt={page.title} />}
    {page.cards && <div className="infoCards">{page.cards.map(([a,b]) => <div key={a}><h3>{a}</h3><p>{b}</p></div>)}</div>}
  </section>;
}

export function ServicePage({ page }) {
  return <section className="section pageHero">
    <div className="pageCopy"><span>Layanan</span><h1>{page.title}</h1><p>{page.desc}</p><p>Halaman ini sudah dipisahkan sebagai route React sehingga alur layanan bisa dikembangkan menjadi form, tracking, atau CMS tanpa menyentuh file PHP native.</p></div>
    {page.flow && <img className="flowImage" src={asset(page.flow)} alt={`Flowchart ${page.title}`} />}
  </section>;
}

export function DownloadPage({ title, items }) {
  return <section className="section"><div className="sectionTitle"><span>Unduhan</span><h1>{title}</h1><p>Dokumen tetap berada di folder asset publik dan dapat diganti/ditambah melalui Admin Page.</p></div><div className="downloadList">{items.map(([name,path]) => <a key={path} href={asset(path)} target="_blank" rel="noreferrer"><strong>{name}</strong><span>Download PDF</span></a>)}</div></section>;
}

export function NotFound({ path = '' }) {
  return <CmsPage path={path || window.location.pathname} />;
}

function normalize(path) {
  let p = (path || '/').replace(/\/$/, '') || '/';
  p = p.replace(/\.php$/, '').replaceAll('_', '-');
  return routeAliases[p] || p;
}

export function pageForPath(path) {
  const p = normalize(path);
  if (staticPages[p]) return <StaticPage page={staticPages[p]} />;
  if (servicePages[p]) return <ServicePage page={servicePages[p]} />;
  if (downloads[p]) {
    const titles = { '/unduhan/renstra': 'Rencana Strategis', '/unduhan/renja': 'Rencana Kerja', '/unduhan/laporan': 'Laporan' };
    return <DownloadPage title={titles[p]} items={downloads[p]} />;
  }
  return <CmsPage path={p} />;
}
