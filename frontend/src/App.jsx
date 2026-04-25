// src/App.jsx
// Componente raíz: provee contexto, renderiza layout y páginas

import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import { useSimulator } from './hooks/useSimulator';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import IAModal from './components/ui/IAModal';
import Dashboard from './pages/Dashboard';
import ZonesPage from './pages/ZonesPage';
import DevicesPage from './pages/DevicesPage';
import AlertsPage from './pages/AlertsPage';
import SettingsPage from './pages/SettingsPage';

function PageContent() {
  const { activePage } = useApp();
  useSimulator(); // activar simulador en modo demo

  const pages = {
    dashboard: <Dashboard />,
    zones: <ZonesPage />,
    devices: <DevicesPage />,
    alerts: <AlertsPage />,
    analytics: (
      <div style={{ padding: 20 }}>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.4rem', marginBottom: 12 }}>Analítica Avanzada</h1>
        <p style={{ color: 'var(--text-dim)' }}>Consulta el historial completo de lecturas de sensores en el Dashboard.</p>
      </div>
    ),
    settings: <SettingsPage />,
  };

  return pages[activePage] || pages.dashboard;
}

export default function App() {
  return (
    <AppProvider>
      <div className="app-layout">
        <Header />
        <div className="main-wrapper">
          <Sidebar />
          <main className="content-area">
            <PageContent />
          </main>
        </div>
        <IAModal />
      </div>
    </AppProvider>
  );
}
