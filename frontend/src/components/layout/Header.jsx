// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/helpers';

export default function Header() {
  const { telemetry, connectionMode, isConnected, setIaModalOpen } = useApp();
  const [time, setTime] = useState(formatTime());

  useEffect(() => {
    const t = setInterval(() => setTime(formatTime()), 1000);
    return () => clearInterval(t);
  }, []);

  const online = connectionMode === 'demo' || isConnected;
  const statusText = connectionMode === 'demo'
    ? 'SIMULADOR ACTIVO'
    : isConnected ? 'ESP32 ONLINE ☁️' : 'ESP32 DESCONECTADO';

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: 'var(--header-h)',
      background: '#0d1424',
      borderBottom: '1px solid var(--panel-border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary), #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 15px var(--primary-glow)',
        }}>
          <i className="fas fa-seedling" style={{ color: 'white', fontSize: 16 }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            HydroSmart <span style={{ color: 'var(--primary)' }}>Pro</span>
          </div>
          <div className="header-subtitle" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>
            DASHBOARD IoT HIDROPÓNICO
          </div>
        </div>
      </div>

      {/* Status Pills */}
      <div className="header-pills" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {/* ESP Status */}
        <div className={`status-pill ${online ? 'pill-green' : 'pill-gray'}`} style={{ padding: '4px 10px' }}>
          <div className={`status-dot ${online ? 'pulse' : 'offline'}`} />
          <span className="header-status-text">{statusText}</span>
        </div>

        {/* Signal */}
        {connectionMode === 'cloud' && isConnected && (
          <div className="status-pill pill-gray" style={{ padding: '4px 10px' }}>
            <i className="fas fa-wifi" />
            <span className="header-status-text">{telemetry.signal}%</span>
          </div>
        )}

        {/* Clock */}
        <div className="status-pill pill-gray" style={{ padding: '4px 10px' }}>
          <i className="far fa-clock" />
          {time}
        </div>

        {/* AI Button */}
        <button
          id="btn-ia-header"
          onClick={() => setIaModalOpen(true)}
          className="status-pill pill-purple"
          style={{ cursor: 'pointer', border: 'none', background: 'rgba(139,92,246,0.2)', fontFamily: 'inherit', letterSpacing: '0.5px', fontWeight: 700, fontSize: 11, padding: '4px 10px' }}
        >
          <i className="fas fa-robot" />
          <span className="header-status-text">AGRO-IA</span>
        </button>
      </div>
    </header>
  );
}
