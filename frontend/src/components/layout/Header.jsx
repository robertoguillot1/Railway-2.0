// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/helpers';

export default function Header() {
  const { telemetry, connectionMode, isConnected, setIaModalOpen, farms, selectedFarm, setSelectedFarm } = useApp();
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

      {/* Farm Selector */}
      {farms.length > 0 && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1 }}>FINCA:</div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedFarm?.id || ''}
              onChange={(e) => {
                const farm = farms.find(f => f.id === parseInt(e.target.value));
                setSelectedFarm(farm);
              }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
                padding: '6px 35px 6px 15px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'Outfit, sans-serif',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s'
              }}
            >
              {farms.map(f => (
                <option key={f.id} value={f.id} style={{ background: '#0d1424', color: 'white' }}>{f.name.toUpperCase()}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--primary)', pointerEvents: 'none' }} />
          </div>
        </div>
      )}

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
