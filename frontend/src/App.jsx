// src/App.jsx
// Componente raíz: provee contexto, maneja login y renderiza layout

import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { useSimulator } from './hooks/useSimulator';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
import IAModal from './components/ui/IAModal';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ZonesPage from './pages/ZonesPage';
import DevicesPage from './pages/DevicesPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import RbacPage from './pages/RbacPage';

function PageContent() {
  const { activePage } = useApp();
  const { isAdmin } = useAuth();
  useSimulator();

  const pages = {
    dashboard: <Dashboard />,
    zones: <ZonesPage />,
    devices: <DevicesPage />,
    alerts: <AlertsPage />,
    analytics: <AnalyticsPage />,
    settings: <SettingsPage />,
    ...(isAdmin && { 
      users: <UsersPage />,
      rbac: <RbacPage />,
    }),
  };

  return pages[activePage] || pages.dashboard;
}

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#080d14', flexDirection: 'column', gap: 16
      }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-seedling" style={{ fontSize: 24, color: 'white' }} />
        </div>
        <div style={{ color: '#475569', fontFamily: 'Outfit', fontSize: 13, letterSpacing: 2 }}>
          <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 8 }} />
          CARGANDO SISTEMA...
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

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
        <MobileNav />
        <IAModal />
      </div>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
