// src/App.jsx
// Componente raíz: provee contexto, maneja login y renderiza layout

import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
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
import OnboardingPage from './pages/OnboardingPage';
import AuditLogsPage from './pages/AuditLogsPage';

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
      logs: <AuditLogsPage />,
    }),
  };

  return pages[activePage] || pages.dashboard;
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { 
    farms, isInitialDataLoaded, loadInitialData,
    showOnboarding, setShowOnboarding, onboardingType
  } = useApp();

  // Cargar datos iniciales cuando el usuario hace login
  useEffect(() => {
    if (user && !isInitialDataLoaded) {
      loadInitialData();
    }
  }, [user, isInitialDataLoaded, loadInitialData]);

  // Determinar si mostrar onboarding (solo para usuarios nuevos sin granjas)
  useEffect(() => {
    if (isInitialDataLoaded && user && farms.length === 0 && !showOnboarding) {
      setShowOnboarding(true);
    }
  }, [isInitialDataLoaded, user, farms, showOnboarding, setShowOnboarding]);

  // Loading inicial de autenticación
  if (authLoading) {
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

  // No está logueado
  if (!user) return <LoginPage />;

  // Mostrar Onboarding si es necesario
  if (showOnboarding) {
    return (
      <OnboardingPage 
        isAbbreviated={onboardingType === 'abbreviated'}
        onComplete={async () => {
          await loadInitialData();
          setShowOnboarding(false);
        }}
      />
    );
  }

  // Dashboard normal
  return (
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
  );
}

// Componente interno que provee AppProvider
function AppWithProvider() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

// Wrapper que provee AuthProvider
function AppShell() {
  return (
    <AuthProvider>
      <AppWithProvider />
    </AuthProvider>
  );
}

export default function App() {
  return <AppShell />;
}