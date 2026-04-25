// src/pages/ZonesPage.jsx
// Vista de zonas hidropónicas con info de cultivos y progreso de ciclo

import { useApp } from '../context/AppContext';
import { STAGE_COLORS } from '../utils/helpers';

const STAGE_DISPLAY = {
  GERMINATION: { label: 'Germinación', icon: 'fa-seedling', color: '#8b5cf6' },
  GROWTH: { label: 'Crecimiento', icon: 'fa-leaf', color: '#10b981' },
  FLOWERING: { label: 'Floración', icon: 'fa-spa', color: '#f59e0b' },
  HARVEST: { label: 'Cosecha', icon: 'fa-wheat-awn', color: '#ef4444' },
};

const MOCK_ZONES = [
  { id: 1, name: 'Módulo A - Lechuga', code: 'zona-a', current_stage: 'GROWTH', crop_type: { name: 'Lechuga Butterhead', duration_days: 35 }, start_date: '2026-04-01', current_day: 24, active: true },
  { id: 2, name: 'Módulo B - Albahaca', code: 'zona-b', current_stage: 'GERMINATION', crop_type: { name: 'Albahaca Genovesa', duration_days: 28 }, start_date: '2026-04-15', current_day: 10, active: true },
  { id: 3, name: 'Módulo C - Espinaca', code: 'zona-c', current_stage: 'HARVEST', crop_type: { name: 'Espinaca Baby', duration_days: 30 }, start_date: '2026-03-20', current_day: 36, active: false },
];

function ZoneCard({ zone }) {
  const stage = STAGE_DISPLAY[zone.current_stage] || STAGE_DISPLAY.GROWTH;
  const progress = Math.min((zone.current_day / (zone.crop_type?.duration_days || 30)) * 100, 100);

  return (
    <div className="glass-panel" style={{ opacity: zone.active ? 1 : 0.6 }}>
      <div className="panel-inner">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{zone.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>
              <i className="fas fa-qrcode" style={{ marginRight: 5 }} />{zone.code}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge" style={{ background: `${stage.color}20`, color: stage.color }}>
              <i className={`fas ${stage.icon}`} /> {stage.label}
            </span>
            <span className={`badge ${zone.active ? 'badge-ok' : 'badge-danger'}`}>
              {zone.active ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>
        </div>

        {/* Crop Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 11, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>CULTIVO</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{zone.crop_type?.name || 'Sin cultivo'}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 11, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>DÍA DEL CICLO</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>
              Día {zone.current_day} / {zone.crop_type?.duration_days || '—'}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: 0.5 }}>
            <span>PROGRESO DEL CICLO</span>
            <span style={{ color: stage.color }}>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)` }} />
          </div>
        </div>

        {/* Start date */}
        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 10 }}>
          <i className="fas fa-calendar" style={{ marginRight: 6 }} />
          Inicio: {zone.start_date || '—'}
        </div>
      </div>
    </div>
  );
}

export default function ZonesPage() {
  const { zones } = useApp();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          Módulos Hidropónicos
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Monitoreo de ciclos de cultivo y etapas de crecimiento por zona.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {zones.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>
            No hay zonas registradas en la nube.
          </div>
        ) : (
          zones.map(zone => <ZoneCard key={zone.id} zone={zone} />)
        )}
      </div>
    </div>
  );
}
