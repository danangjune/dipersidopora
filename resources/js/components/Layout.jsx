import { menu, asset, routesIndex } from '../data/siteContent';
import { useEffect, useState } from 'react';
import { InformationCircleIcon, ChartBarIcon, Cog6ToothIcon, ArrowDownTrayIcon, ShieldCheckIcon, ClipboardDocumentCheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const groupIcons = {
  Tentang: InformationCircleIcon,
  Informasi: ChartBarIcon,
  Layanan: Cog6ToothIcon,
  Unduhan: ArrowDownTrayIcon,
};

export function Header() {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const results = keyword.trim() ? routesIndex.filter(([label]) => label.toLowerCase().includes(keyword.toLowerCase())).slice(0, 6) : [];

  return <>
    <div className="top-hero">
      <a className="brand" href="/">
        <img src={asset('images/dp1.png')} alt="DISPERDAGIN Kota Kediri" />
        <img src={asset('images/mapan.png')} alt="Kediri Mapan" />
      </a>
      
      <div className="searchBox">
        <MagnifyingGlassIcon className="searchIcon" />
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Cari informasi..." />
        {results.length > 0 && <div className="searchResults">{results.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>}
      </div>
    </div>
    <nav className="mainNav">
      <a className="home" href="/" title="Beranda">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z"/></svg>
      </a>
      <button className="hamburger" onClick={() => setOpen(!open)}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd"/></svg>
      </button>
      <div className={`navItems ${open ? 'show' : ''}`}>
        {menu.map(group => {
          const GroupIcon = groupIcons[group.title];
          return <div className="dropdown" key={group.title}>
            <button>
              {GroupIcon && <GroupIcon className="nav-icon" />}
              {group.title}
              <span className="arrow">▾</span>
            </button>
            <div className="dropdownMenu">
              {group.items.map(item => <a key={item.href} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>
                {item.label}
              </a>)}
            </div>
          </div>;
        })}
        <a href="/zona-integritas"><ShieldCheckIcon className="nav-icon" />Zona Integritas</a>
        <a href="/survey"><ClipboardDocumentCheckIcon className="nav-icon" />Survey</a>
      </div>
    </nav>
  </>;
}

export function Footer() {
  const [visitors, setVisitors] = useState(null);
  const [settings, setSettings] = useState({});
  useEffect(() => {
    fetch('/api/visitors/increment', {method:'POST', headers:{'Accept':'application/json'}})
      .then(r => r.json()).then(d => setVisitors(d.count)).catch(() => null);
    fetch('/api/site/settings')
      .then(r => r.json()).then(d => setSettings(d.data || {})).catch(() => ({}));
  }, []);
  const address = settings.address || 'Jl. Penanggungan No. 7, Bandar Lor, Kec. Mojoroto, Kota Kediri, Jawa Timur';
  const phone = settings.phone || '0354-771908';
  const email = settings.email || 'disperdagin@kedirikota.go.id';
  return <footer className="footer">
    <div className="footerGrid">
      <div>
        <img src={asset('images/dp1.png')} alt="DISPERDAGIN" />
        <p style={{marginTop:12,fontSize:13}}>Dinas Perdagangan dan Perindustrian Kota Kediri</p>
      </div>
      <div><h3>Alamat</h3><p>{address}</p></div>
      <div><h3>Hubungi Kami</h3><p>{phone}</p><p>{email}</p></div>
      <div><h3>Statistik</h3><p className="visitorCount">{visitors ?? '—'} / Hari</p></div>
    </div>
    <p className="copyright">Copyright © {new Date().getFullYear()} DISPERDAGIN Kota Kediri</p>
    <a className="floatingMail" href={`mailto:${email}?subject=Chat&body=Halo DISPERDAGIN!`}>Hubungi Kami</a>
  </footer>;
}

export default function Layout({ children }) {
  return <><Header /><main>{children}</main><Footer /></>;
}
