// src/components/layout/MobileNav.jsx
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function MobileNav() {
  const { activePage, setActivePage } = useApp();
  const { isAdmin, logout } = useAuth();

  const items = [
    { id: 'dashboard', icon: 'fa-th-large' },
    { id: 'devices', icon: 'fa-microchip' },
    { id: 'analytics', icon: 'fa-chart-line' },
    { id: 'alerts', icon: 'fa-bell' },
    { id: 'settings', icon: 'fa-cog' },
  ];

  if (isAdmin) {
    items.push({ id: 'logs', icon: 'fa-history' });
  }

  return (
    <nav className="mobile-nav" style={{ display: 'none' }}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          style={{
            background: 'none',
            border: 'none',
            color: activePage === item.id ? 'var(--primary)' : 'var(--text-dim)',
            fontSize: '20px',
            padding: '10px',
            transition: 'all 0.2s'
          }}
        >
          <i className={`fas ${item.icon}`} />
        </button>
      ))}
      <button
        onClick={() => { if (confirm('¿Cerrar sesión?')) logout(); }}
        style={{
          background: 'none',
          border: 'none',
          color: '#ef4444',
          fontSize: '20px',
          padding: '10px',
        }}
      >
        <i className="fas fa-sign-out-alt" />
      </button>
    </nav>
  );
}
