// src/components/panels/TelemetryPanel.jsx
// Panel izquierdo: Humedad (ring), Temperatura, pH, EC, Nivel de Agua, Estado Bomba

import { useApp } from '../../context/AppContext';
import { ringOffset, getPHStatus, getECStatus, getTempStatus } from '../../utils/helpers';

function MiniCard({ icon, iconBg, iconColor, label, value, valueColor, extra }) {
  return (
    <div className="mini-card" style={{ marginBottom: 9 }}>
      <div className="mini-card-icon" style={{ background: iconBg, color: iconColor }}>
        <i className={`fas ${icon}`} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="mini-card-label">{label}</div>
        <div className="mini-card-value" style={{ color: valueColor || 'var(--text-main)' }}>
          {value}
        </div>
      </div>
      {extra}
    </div>
  );
}

export default function TelemetryPanel() {
  const { telemetry } = useApp();
  const { humidity, temperature, airHumidity, ph, ec, waterLevel, pumpState } = telemetry;

  const circ = 2 * Math.PI * 58;
  const offset = circ - (circ * Math.min(humidity, 100)) / 100;

  const phStatus = getPHStatus(ph);
  const ecStatus = getECStatus(ec);
  const tempStatus = getTempStatus(temperature);

  const humColor = humidity < 30 ? '#ef4444' : humidity < 60 ? '#f59e0b' : '#10b981';

  return (
    <div className="glass-panel">
      <div className="panel-inner">
        <div className="panel-header">
          <i className="fas fa-satellite-dish" />
          Telemetría
        </div>

        {/* Humidity Ring */}
        <div className="ring-container">
          <svg width="130" height="130" className="ring-svg">
            <circle cx="65" cy="65" r="58" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
            <circle
              cx="65" cy="65" r="58" fill="none"
              stroke={humColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${humColor})` }}
            />
          </svg>
          <div className="ring-val" style={{ color: humColor }}>{Math.round(humidity)}%</div>
        </div>
        <div className="ring-label">Humedad del Sustrato</div>

        {/* Temperature */}
        <MiniCard
          icon="fa-thermometer-half"
          iconBg="rgba(245,158,11,0.12)"
          iconColor="#f59e0b"
          label="Temperatura Ambiente"
          value={`${temperature.toFixed(1)}°C`}
          valueColor={tempStatus.color}
          extra={<span className={`badge ${temperature > 30 ? 'badge-danger' : temperature < 15 ? 'badge-purple' : 'badge-ok'}`}>{tempStatus.label}</span>}
        />

        {/* Air Humidity */}
        <MiniCard
          icon="fa-wind"
          iconBg="rgba(99,102,241,0.12)"
          iconColor="#818cf8"
          label="Humedad Ambiental"
          value={`${Math.round(airHumidity)}%`}
        />

        {/* pH */}
        <MiniCard
          icon="fa-flask"
          iconBg="rgba(139,92,246,0.12)"
          iconColor="#a78bfa"
          label="pH de la Solución"
          value={ph.toFixed(2)}
          valueColor={phStatus.color}
          extra={<span className={`badge ${phStatus.badge}`}>{phStatus.label}</span>}
        />

        {/* EC */}
        <MiniCard
          icon="fa-bolt"
          iconBg="rgba(56,189,248,0.12)"
          iconColor="#38bdf8"
          label="Conductividad (EC)"
          value={`${ec.toFixed(2)} mS`}
          valueColor={ecStatus.color}
          extra={<span className={`badge ${ecStatus.badge}`}>{ecStatus.label}</span>}
        />

        {/* Water Level */}
        <div className="mini-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginBottom: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            <div className="mini-card-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)' }}>
              <i className="fas fa-water" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="mini-card-label">Nivel del Tanque</div>
              <div className="mini-card-value">{Math.round(waterLevel)}%</div>
            </div>
          </div>
          <div className="progress-bar" style={{ width: '100%' }}>
            <div className="progress-fill" style={{ width: `${waterLevel}%`, background: waterLevel < 30 ? '#ef4444' : 'linear-gradient(90deg, var(--primary), #34d399)' }} />
          </div>
        </div>

        {/* Pump State */}
        <div className="mini-card" style={{ marginTop: 'auto', background: pumpState ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.2)', borderColor: pumpState ? 'rgba(16,185,129,0.3)' : 'transparent' }}>
          <div className="mini-card-icon" style={{ background: pumpState ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.1)', color: pumpState ? 'var(--primary)' : 'var(--accent-red)' }}>
            <i className={`fas fa-faucet`} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="mini-card-label">Estado Bomba</div>
            <div className="mini-card-value" style={{ color: pumpState ? 'var(--primary)' : 'var(--text-dim)' }}>
              {pumpState ? 'EN OPERACIÓN' : 'DETENIDA'}
            </div>
          </div>
          {pumpState && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulseDot 1.5s infinite', boxShadow: '0 0 8px var(--primary)' }} />}
        </div>
      </div>
    </div>
  );
}
