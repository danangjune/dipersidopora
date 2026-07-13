import './bootstrap';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import Home from './pages/Home';
import MarketPage from './pages/MarketPage';
import SurveyPage from './pages/SurveyPage';
import AdminPage from './pages/AdminPage';
import TentangPage from './pages/TentangPage';
import StrukturPage from './pages/StrukturPage';
import ProgramKegiatanPage from './pages/ProgramKegiatanPage';
import PasarPage from './pages/PasarPage';
import PasarModernPage from './pages/PasarModernPage';
import MallPage from './pages/MallPage';
import { PklDashboard, PklInput } from './pages/PklPages';
import IkmPage from './pages/IkmPage';
import LayananHalalPage from './pages/LayananHalalPage';
import LayananMerkPage from './pages/LayananMerkPage';
import LayananSinasPage from './pages/LayananSinasPage';
import LayananTeraPage from './pages/LayananTeraPage';
import LayananTdgPage from './pages/LayananTdgPage';
import LayananMinholPage from './pages/LayananMinholPage';
import ZonaIntegritasPage from './pages/ZonaIntegritasPage';
import { pageForPath } from './pages/StaticPage';

function normalize(path) {
  return (path || '/').replace(/\/$/, '') || '/';
}

function App() {
  const path = normalize(window.location.pathname);

  let page = null;
  if (path === '/') page = <Home />;
  else if (['/informasi-pasar'].includes(path)) page = <MarketPage />;
  else if (['/survey'].includes(path)) page = <SurveyPage />;
  else if (['/tentang'].includes(path)) page = <TentangPage />;
  else if (['/struktur'].includes(path)) page = <StrukturPage />;
  else if (['/program-kegiatan'].includes(path)) page = <ProgramKegiatanPage />;
  else if (['/pasar'].includes(path)) page = <PasarPage />;
  else if (['/pasar-modern'].includes(path)) page = <PasarModernPage />;
  else if (['/mall', '/pusat-perbelanjaan'].includes(path)) page = <MallPage />;
  else if (['/ikm'].includes(path)) page = <IkmPage />;
  else if (['/layanan/halal'].includes(path)) page = <LayananHalalPage />;
  else if (['/layanan/merk'].includes(path)) page = <LayananMerkPage />;
  else if (['/layanan/sinas', '/layanan/sinas'].includes(path)) page = <LayananSinasPage />;
  else if (['/layanan/tera'].includes(path)) page = <LayananTeraPage />;
  else if (['/layanan/td-gudang', '/layanan/tdg', '/layanan/td-gudang'].includes(path)) page = <LayananTdgPage />;
  else if (['/layanan/minhol'].includes(path)) page = <LayananMinholPage />;
  else if (['/zona-integritas'].includes(path)) page = <ZonaIntegritasPage />;
  else page = pageForPath(path);

  return <Layout>{page}</Layout>
}

const container = document.getElementById('root');

if (container) {
    const root = window.__DISPERDAGIN_ROOT__ ?? createRoot(container);

    window.__DISPERDAGIN_ROOT__ = root;

    root.render(<App />);
}
