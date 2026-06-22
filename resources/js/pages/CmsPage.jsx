import { useEffect, useState } from 'react';
import { asset } from '../data/siteContent';

export default function CmsPage({ path }) {
  const slug = path.replace(/^\//, '').replace(/\.php$/, '').replaceAll('_', '-');
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/site/page/${slug}`).then(async r => {
      if (!r.ok) throw new Error('missing');
      return r.json();
    }).then(d => setPage(d.data)).catch(() => setMissing(true)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <section className="section"><div className="emptyState">Memuat halaman...</div></section>;
  if (missing || !page) return <section className="section"><div className="emptyState"><h1>Halaman belum tersedia</h1><p>Konten belum dipublish di CMS admin.</p><a className="btn" href="/admin">Buka Admin</a></div></section>;

  return <section className="section pageHero">
    <div className="pageCopy"><span>{page.eyebrow || page.group || 'DISPERDAGIN'}</span><h1>{page.title}</h1>{page.excerpt && <p className="lead">{page.excerpt}</p>}{page.content?.split('\n').filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</div>
    {page.image && <img src={asset(page.image)} alt={page.title} onError={(e)=>e.currentTarget.style.display='none'} />}
    {Array.isArray(page.cards) && page.cards.length > 0 && <div className="infoCards">{page.cards.map((card,i)=><div key={i}><h3>{card.title || card[0]}</h3><p>{card.text || card[1]}</p></div>)}</div>}
  </section>;
}
