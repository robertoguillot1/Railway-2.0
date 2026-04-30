import { useApp } from '../context/AppContext';
import { acknowledgeAlert } from '../api/hydroApi';
import { formatDate } from '../utils/helpers';
import { useState } from 'react';

const SEVERITY_CONFIG = {
  CRITICAL: { label: 'CRÍTICA', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: 'fa-exclamation-triangle' },
  WARNING: { label: 'ADVERTENCIA', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: 'fa-exclamation-circle' },
  INFO: { label: 'INFORMATIVA', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)', icon: 'fa-info-circle' },
};

function AlertCard({ alert, onAcknowledge }) {
  const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;
  return (
    <div style={{
      background: alert.acknowledged ? 'rgba(0,0,0,0.15)' : cfg.bg,
      border: `1px solid ${alert.acknowledged ? 'rgba(255,255,255,0.04)' : cfg.border}`,
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      transition: 'all 0.3s',
      opacity: alert.acknowledged ? 0.55 : 1,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11, flexShrink: 0,
        background: `${cfg.color}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, color: cfg.color,
      }}>
        <i className={`fas ${cfg.icon}`} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{alert.title}</span>
          <span className="badge" style={{ background: `${cfg.color}20`, color: cfg.color }}>{cfg.label}</span>
          {alert.acknowledged && <span className="badge badge-ok" style={{ fontSize: 9 }}>✓ REVISADA</span>}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{alert.message}</p>
        <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
          <i className="far fa-clock" style={{ marginRight: 4 }} />
          {formatDate(new Date(alert.created_at))}
        </div>
      </div>
      {!alert.acknowledged && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          style={{
            flexShrink: 0,
            padding: '7px 14px',
            borderRadius: 9,
            border: `1px solid ${cfg.border}`,
            background: 'transparent',
            color: cfg.color,
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Revisar
        </button>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, setAlerts, connectionMode, addLog } = useApp();
  const [filter, setFilter] = useState('ALL'); // ALL, CRITICAL, WARNING, INFO
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  const handleAcknowledge = async (id) => {
    if (connectionMode === 'cloud') {
      try {
        await acknowledgeAlert(id);
        addLog(`✅ NUBE: Alerta revisada.`);
      } catch {
        addLog(`❌ ERROR: No se pudo revisar la alerta.`);
      }
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = filter === 'ALL' || a.severity === filter;
    const matchesStatus = showAcknowledged || !a.acknowledged;
    return matchesSeverity && matchesStatus;
  });

  const unread = alerts.filter(a => !a.acknowledged).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
            Alertas del Sistema
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {unread > 0 ? `${unread} alerta${unread > 1 ? 's' : ''} sin revisar` : 'Todas las alertas revisadas ✅'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            <option value="ALL">TODAS LAS SEVERIDADES</option>
            <option value="CRITICAL">SOLO CRÍTICAS</option>
            <option value="WARNING">ADVERTENCIAS</option>
            <option value="INFO">INFORMATIVAS</option>
          </select>
          <button
            onClick={() => setShowAcknowledged(!showAcknowledged)}
            style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: showAcknowledged ? 'rgba(16,185,129,0.1)' : 'transparent', color: showAcknowledged ? 'var(--primary)' : 'var(--text-dim)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            {showAcknowledged ? 'OCULTAR REVISADAS' : 'MOSTRAR REVISADAS'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', borderRadius: 20 }}>
            <i className="fas fa-bell-slash" style={{ fontSize: 32, marginBottom: 15, opacity: 0.2 }} />
            <p>No se encontraron alertas con los filtros aplicados.</p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
          ))
        )}
      </div>
    </div>
  );
}
