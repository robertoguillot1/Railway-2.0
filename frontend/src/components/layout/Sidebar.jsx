// src/components/layout/Sidebar.jsx
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { id: 'zones', icon: 'fa-layer-group', label: 'Zonas' },
  { id: 'devices', icon: 'fa-microchip', label: 'Dispositivos' },
  { id: 'analytics', icon: 'fa-chart-line', label: 'Analítica' },
  { id: 'alerts', icon: 'fa-bell', label: 'Alertas' },
  { id: 'settings', icon: 'fa-cog', label: 'Ajustes' },
];

const ADMIN_ITEMS = [
  { id: 'users', icon: 'fa-users-cog', label: 'Usuarios' },
  { id: 'rbac', icon: 'fa-shield-alt', label: 'Roles y Permisos' },
  { id: 'logs', icon: 'fa-history', label: 'Trazabilidad' },
];

export default function Sidebar() {
  const { activePage, setActivePage, setIaModalOpen, alerts, setShowOnboarding, setOnboardingType } = useApp();
  const { isAdmin, user, logout } = useAuth();
  const unread = alerts?.filter(a => !a.acknowledged)?.length || 0;

  const handleNewFarm = () => {
    setOnboardingType('abbreviated');
    setShowOnboarding(true);
  };

  const renderBtn = (item) => (
    <button
      key={item.id}
      id={`nav-${item.id}`}
      title={item.label}
      onClick={() => setActivePage(item.id)}
      style={{
        width: 46, height: 46,
        borderRadius: 13,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        marginBottom: 14,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        fontSize: 18,
        background: activePage === item.id
          ? 'linear-gradient(135deg, var(--primary), #059669)'
          : 'transparent',
        color: activePage === item.id ? 'white' : 'var(--text-dim)',
        boxShadow: activePage === item.id ? '0 4px 14px var(--primary-glow)' : 'none',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={e => {
        if (activePage !== item.id) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
        if (activePage !== item.id) e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={e => {
        if (activePage !== item.id) e.currentTarget.style.background = 'transparent';
        if (activePage !== item.id) e.currentTarget.style.color = 'var(--text-dim)';
      }}
    >
      <i className={`fas ${item.icon}`} />
      {item.id === 'alerts' && unread > 0 && (
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 8, height: 8,
          background: 'var(--accent-red)',
          borderRadius: '50%',
          boxShadow: '0 0 6px var(--accent-red)',
        }} />
      )}
    </button>
  );

  return (
    <aside style={{
      position: 'fixed',
      left: 0, top: 'var(--header-h)', bottom: 0,
      width: 'var(--sidebar-w)',
      background: '#0d1424',
      borderRight: '1px solid var(--panel-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 20, zIndex: 900,
    }}>
      {NAV_ITEMS.map(renderBtn)}

      {/* Admin section separator */}
      {isAdmin && (
        <>
          <div style={{ width: 30, height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0 16px' }} />
          {ADMIN_ITEMS.map(renderBtn)}
        </>
      )}

      {/* Nueva Granja Button */}
      <button
        id="nav-new-farm"
        title="Nueva Granja"
        onClick={handleNewFarm}
        style={{
          width: 46, height: 46, borderRadius: 13,
          marginTop: 16,
          border: '1px dashed rgba(16,185,129,0.4)',
          background: 'rgba(16,185,129,0.08)',
          color: 'var(--primary)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', fontSize: 16,
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
      >
        <i className="fas fa-plus" />
      </button>

      {/* AI Button */}
      <button
        id="nav-ia"
        title="Agro-Asistente IA"
        onClick={() => setIaModalOpen(true)}
        style={{
          marginTop: 'auto',
          width: 46, height: 46, borderRadius: 13,
          border: '1px solid rgba(139,92,246,0.5)',
          background: 'rgba(139,92,246,0.2)',
          color: '#c4b5fd',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', fontSize: 18,
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.2)'; }}
      >
        <i className="fas fa-robot" />
      </button>

      {/* Logout Button */}
      <button
        id="nav-logout"
        title={`Cerrar sesión (${user?.username})`}
        onClick={() => { if (confirm('¿Cerrar sesión?')) logout(); }}
        style={{
          marginBottom: 20, marginTop: 8,
          width: 46, height: 46, borderRadius: 13,
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.08)',
          color: '#ef4444',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          cursor: 'pointer', fontSize: 16,
          transition: 'all 0.25s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
      >
        <i className="fas fa-sign-out-alt" />
      </button>
    </aside>
  );
}
