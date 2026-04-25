// src/pages/AlertsPage.jsx
// Vista de alertas del sistema (SystemAlert) con acknowledgement

import { useApp } from '../context/AppContext';
import { acknowledgeAlert } from '../api/hydroApi';
import { formatDate } from '../utils/helpers';

const MOCK_ALERTS = [
  { id: 1, title: 'pH Fuera de Rango', message: 'El pH del módulo A superó 7.5 por más de 30 minutos.', severity: 'CRITICAL', acknowledged: false, created_at: new Date().toISOString() },
  { id: 2, title: 'Nivel de Tanque Bajo', message: 'El depósito de nutrientes del módulo B está al 22%.', severity: 'WARNING', acknowledged: false, created_at: new Date().toISOString() },
  { id: 3, title: 'ESP32 Reconectado', message: 'El dispositivo HYDRO-001 volvió a estar en línea tras 5 minutos offline.', severity: 'INFO', acknowledged: true, created_at: new Date().toISOString() },
];

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
          id={`btn-ack-${alert.id}`}
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
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${cfg.color}15`}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Revisar
        </button>
      )}
    </div>
  );
}

export default function AlertsPage() {
  const { alerts, setAlerts, connectionMode, addLog } = useApp();
  const displayAlerts = alerts.length > 0 ? alerts : MOCK_ALERTS;

  const handleAcknowledge = async (id) => {
    if (connectionMode === 'cloud') {
      try {
        await acknowledgeAlert(id);
        addLog(`✅ ALERTA #${id} marcada como revisada en la nube.`);
      } catch {
        addLog(`❌ ERROR: No se pudo actualizar la alerta #${id}.`);
      }
    } else {
      addLog(`✅ DEMO: Alerta #${id} marcada como revisada.`);
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const unread = displayAlerts.filter(a => !a.acknowledged).length;

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
        {unread > 0 && (
          <button
            id="btn-ack-all"
            onClick={() => displayAlerts.filter(a => !a.acknowledged).forEach(a => handleAcknowledge(a.id))}
            style={{ padding: '9px 18px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
          >
            Revisar todas
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayAlerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />
        ))}
      </div>
    </div>
  );
}
