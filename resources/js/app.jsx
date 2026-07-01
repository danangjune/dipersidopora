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
  else if (['/informasi-pasar'].includes(path)) page = <MarketPage />;
  else if (path === '/internal/harga') page = <MarketPage internal />;
  else if (['/survey'].includes(path)) page = <SurveyPage />;
  else page = pageForPath(path);

  return <Layout>{page}</Layout>
}

const container = document.getElementById('root');

if (container) {
    const root = window.__DISPERDAGIN_ROOT__ ?? createRoot(container);

    window.__DISPERDAGIN_ROOT__ = root;

    root.render(<App />);
}
