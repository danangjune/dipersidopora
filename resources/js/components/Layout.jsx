import { menu, asset, routesIndex } from '../data/siteContent';
import { useEffect, useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const results = keyword.trim() ? routesIndex.filter(([label]) => label.toLowerCase().includes(keyword.toLowerCase())).slice(0, 6) : [];

  return <>
    <div className="top-hero">
      <a className="brand" href="/"><img src={asset('images/dp1.png')} alt="DISPERDAGIN" /></a>
      <div className="searchBox">
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Cari informasi..." />
        {results.length > 0 && <div className="searchResults">{results.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>}
      </div>
    </div>
    <nav className="mainNav">
      <a className="home" href="/">⌂</a>
      <button className="hamburger" onClick={() => setOpen(!open)}>☰</button>
      <div className={`navItems ${open ? 'show' : ''}`}>
        {menu.map(group => <div className="dropdown" key={group.title}>
          <button>{group.title}</button>
          <div className="dropdownMenu">{group.items.map(item => <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>{item.label}</a>)}</div>
        </div>)}
        <a href="/zona-integritas">Zona Integritas</a>
        <a href="/survey">Survey</a>
      </div>
    </nav>
  </>;
}

export function Footer() {
  const [visitors, setVisitors] = useState(null);
  useEffect(() => {
    fetch('/api/visitors/increment', {method:'POST', headers:{'Accept':'application/json'}})
      .then(r => r.json()).then(d => setVisitors(d.count)).catch(() => null);
  }, []);
  return <footer className="footer">
    <div className="footerGrid">
      <img src={asset('images/dp1.png')} alt="DISPERDAGIN" />
      <div><h3>Alamat</h3><p>Jl. Penanggungan No. 7, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur</p></div>
      <div><h3>Hubungi Kami</h3><p>0354-771908</p><p>disperdagin@kedirikota.go.id</p></div>
      <div><h3>Statistik Pengunjung</h3><p className="visitorCount">{visitors ?? '—'} / Hari</p></div>
    </div>
    <p className="copyright">Copyright © 2026 DISPERDAGIN</p>
    <a className="floatingMail" href="mailto:disperdagin@kedirikota.go.id?subject=Chat&body=Halo DISPERDAGIN!">Hubungi Kami 👋</a>
  </footer>;
}

export default function Layout({ children }) {
  return <><Header /><main>{children}</main><Footer /></>;
}
