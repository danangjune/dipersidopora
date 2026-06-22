import './bootstrap';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import Home from './pages/Home';
import MarketPage from './pages/MarketPage';
import SurveyPage from './pages/SurveyPage';
import AdminPage from './pages/AdminPage';
import { PklDashboard, PklInput } from './pages/PklPages';
import { pageForPath } from './pages/StaticPage';

function normalize(path) {
  return (path || '/').replace(/\/$/, '') || '/';
}

function App() {
  const path = normalize(window.location.pathname);

  let page = null;
  if (path === '/') page = <Home />;
  else if (['/informasi-pasar', '/informasi-pasar.php', '/hargaKom', '/hargaKom.php', '/harga-komoditas'].includes(path)) page = <MarketPage />;
  else if (path === '/internal/harga') page = <MarketPage internal />;
  else if (['/survey', '/kuesioner', '/kuesioner.php', '/survey_pasar', '/survey-pasar'].includes(path)) page = <SurveyPage />;
  else if (path === '/admin') page = <AdminPage />;
  else if (path === '/pkl/dashboard') page = <PklDashboard />;
  else if (path === '/pkl/input') page = <PklInput />;
  else page = pageForPath(path);

  return <Layout>{page}</Layout>;
}

createRoot(document.getElementById('root')).render(<App />);
