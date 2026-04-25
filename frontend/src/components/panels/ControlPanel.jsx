// src/components/panels/ControlPanel.jsx
// Panel derecho: Control Maestro — Modo Auto/Manual, Nube/Demo, Actuadores, Forzar Bomba

import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function ControlPanel() {
  const {
    connectionMode, setConnectionMode,
    isConnected, setIsConnected,
    operationMode, setOperationMode,
    irrigationThreshold, setIrrigationThreshold,
    stopThreshold, setStopThreshold,
    telemetry, setTelemetry,
    actuators, toggleActuator,
    devices, selectedDeviceId, setSelectedDeviceId,
    addLog,
    startCloudPolling, stopCloudPolling,
  } = useApp();

  const [camUrl, setCamUrl] = useState('');
  const [connecting, setConnecting] = useState(false);

  // ─── Conectar a la nube ─────────────────────────────────────────────────────
  const handleConnect = async () => {
    setConnecting(true);
    addLog('🌐 RED: Contactando backend en Railway...');
    try {
      const url = import.meta.env.VITE_API_URL || 'https://railway-20-production-7eaa.up.railway.app';
      const res = await fetch(`${url}/api/v1/automation/readings/?limit=1`, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        setIsConnected(true);
        setConnectionMode('cloud');
        addLog('✅ NUBE: Conexión establecida. Polling activo cada 5s.');
        startCloudPolling();
      } else {
        // Intentar endpoint legacy
        const res2 = await fetch(`${url}/api/telemetria/historial`, { signal: AbortSignal.timeout(4000) });
        if (res2.ok) {
          setIsConnected(true);
          setConnectionMode('cloud');
          addLog('✅ NUBE: Conectado al endpoint legacy de Railway.');
          startCloudPolling();
        } else throw new Error('Sin respuesta');
      }
    } catch {
      addLog('❌ RED: No se pudo conectar con la base de datos en Railway.');
      setIsConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    stopCloudPolling();
    setIsConnected(false);
    setConnectionMode('demo');
    addLog('🔄 MODO: Desconectado de la nube. Simulador activo.');
  };

  // ─── Toggle Bomba ────────────────────────────────────────────────────────────
  const togglePump = () => {
    const newState = !telemetry.pumpState;
    setTelemetry(prev => ({ ...prev, pumpState: newState }));
    // Controlar el primer actuador tipo PUMP si existe
    const pump = actuators.find(a => a.actuator_type === 'PUMP' || a.name?.toLowerCase().includes('bomba'));
    if (pump) {
      toggleActuator(pump.id, newState, pump.name);
    } else {
      addLog(`👤 MANUAL: Bomba ${newState ? 'ACTIVADA' : 'DETENIDA'}`);
    }
  };

  return (
    <div className="glass-panel">
      <div className="panel-inner">
        <div className="panel-header">
          <i className="fas fa-sliders-h" />
          Control Maestro
        </div>

        {/* IRRIGATION THRESHOLDS */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            <span>UMBRAL RIEGO (SECO)</span>
            <span style={{ color: 'var(--primary)' }}>{irrigationThreshold}%</span>
          </div>
          <input
            type="range" className="range-slider"
            min={10} max={80} value={irrigationThreshold}
            onChange={e => {
              setIrrigationThreshold(Number(e.target.value));
              addLog(`⚙️ CONFIG: Umbral de riego → ${e.target.value}%`);
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 8 }}>
            <span>UMBRAL PARO (HÚMEDO)</span>
            <span style={{ color: 'var(--primary)' }}>{stopThreshold}%</span>
          </div>
          <input
            type="range" className="range-slider"
            min={50} max={100} value={stopThreshold}
            onChange={e => {
              setStopThreshold(Number(e.target.value));
              addLog(`⚙️ CONFIG: Umbral de paro → ${e.target.value}%`);
            }}
          />
        </div>

        {/* OPERATION MODE */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
            MODO DE OPERACIÓN
          </div>
          <div className="mode-toggles">
            {['AUTO', 'MANUAL'].map(m => (
              <button
                key={m}
                id={`btn-op-${m.toLowerCase()}`}
                className={`btn-mode ${operationMode === m ? 'active' : ''}`}
                onClick={() => {
                  setOperationMode(m);
                  addLog(`🔄 MODO: Cambiado a modo ${m}`);
                }}
              >
                <i className={`fas ${m === 'AUTO' ? 'fa-robot' : 'fa-hand-pointer'}`} style={{ marginRight: 5 }} />
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* CONNECTION MODE */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
            <span>FUENTE DE DATOS</span>
            <span style={{
              color: connectionMode === 'cloud' && isConnected ? 'var(--primary)' : 'var(--accent-amber)',
            }}>
              {connectionMode === 'cloud' && isConnected ? '☁️ NUBE CONECTADA' : '🎮 MODO DEMO'}
            </span>
          </div>
          <div className="mode-toggles">
            <button
              id="btn-mode-demo"
              className={`btn-mode ${connectionMode === 'demo' ? 'active' : ''}`}
              onClick={handleDisconnect}
            >
              <i className="fas fa-desktop" style={{ marginRight: 5 }} />
              SIMULADOR
            </button>
            <button
              id="btn-mode-cloud"
              className={`btn-mode ${connectionMode === 'cloud' ? 'active' : ''}`}
              onClick={connectionMode === 'cloud' ? handleDisconnect : handleConnect}
              disabled={connecting}
            >
              {connecting
                ? <><i className="fas fa-spinner spinning" style={{ marginRight: 5 }} />CONECTANDO...</>
                : <><i className="fas fa-cloud" style={{ marginRight: 5 }} />RAILWAY</>
              }
            </button>
          </div>

          {/* Cloud URL info */}
          {connectionMode === 'cloud' && (
            <div className="info-box" style={{ marginTop: 10 }}>
              <i className="fas fa-database" style={{ color: 'var(--primary)', marginRight: 6 }} />
              Conectado a <b>Railway</b>. Datos actualizados cada <b>3 segundos</b>.
            </div>
          )}
        </div>

        {/* DEVICE SELECTOR */}
        {connectionMode === 'cloud' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
              SELECCIONAR DISPOSITIVO (ESP32)
            </div>
            <select
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)',
                outline: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                fontFamily: 'Outfit, sans-serif'
              }}
              value={selectedDeviceId || ''}
              onChange={(e) => {
                const id = e.target.value ? Number(e.target.value) : null;
                setSelectedDeviceId(id);
                if (id) addLog(`📱 DISPOSITIVO: Cambiado a ID #${id}`);
              }}
            >
              {devices.length === 0 ? (
                <option value="" style={{ background: '#1a1d21' }}>Cargando dispositivos...</option>
              ) : (
                <>
                  <option value="" style={{ background: '#1a1d21' }}>-- Seleccionar ESP32 --</option>
                  {devices.map(dev => (
                    <option key={dev.id} value={dev.id} style={{ background: '#1a1d21' }}>
                      {dev.name} ({dev.device_id})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        )}

        {/* ACTUATORS from DB */}
        {actuators.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
              ACTUADORES
            </div>
            {actuators.slice(0, 4).map(act => (
              <div key={act.id} className="actuator-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: act.state ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14,
                    color: act.state ? 'var(--primary)' : 'var(--text-dim)',
                  }}>
                    <i className={`fas ${
                      act.actuator_type === 'PUMP' ? 'fa-faucet' :
                      act.actuator_type === 'OXYGENATOR' ? 'fa-wind' :
                      act.actuator_type === 'DOSER' ? 'fa-flask' : 'fa-fan'
                    }`} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{act.name}</div>
                    <div style={{ fontSize: 9, color: act.state ? 'var(--primary)' : 'var(--text-dim)' }}>
                      {act.state ? 'ACTIVO' : 'INACTIVO'}
                    </div>
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={act.state}
                    onChange={() => toggleActuator(act.id, !act.state, act.name)}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="info-box" style={{ marginBottom: 16 }}>
          <i className="fas fa-info-circle" style={{ color: 'var(--primary)', marginRight: 6 }} />
          En modo <b>{operationMode}</b>: bomba activa si humedad &lt; <b>{irrigationThreshold}%</b>. Paro a <b>{stopThreshold}%</b>.
        </div>

        {/* PUMP CONTROL BUTTON */}
        <button
          id="btn-pump-main"
          className={`btn-primary ${telemetry.pumpState ? 'btn-danger' : ''}`}
          onClick={togglePump}
          style={{ marginTop: 'auto' }}
        >
          <i className={`fas ${telemetry.pumpState ? 'fa-stop' : 'fa-play'}`} />
          {telemetry.pumpState ? 'DETENER RIEGO' : 'FORZAR RIEGO AHORA'}
        </button>
      </div>
    </div>
  );
}
