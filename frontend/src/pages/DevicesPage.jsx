// src/pages/DevicesPage.jsx
// Vista de dispositivos IoT y sensores registrados en la base de datos

import { useApp } from '../context/AppContext';

const MOCK_DEVICES = [
  {
    id: 1, device_id: 'HYDRO-001', name: 'Controlador Principal', firmware_version: '2.1.4', active: true,
    sensors: [
      { id: 1, name: 'Sensor pH', sensor_type: 'PH', unit: 'pH', pin: 'A0', active: true },
      { id: 2, name: 'Sensor EC', sensor_type: 'EC', unit: 'mS/cm', pin: 'A1', active: true },
      { id: 3, name: 'Temp. Agua', sensor_type: 'WATER_TEMP', unit: '°C', pin: 'GPIO4', active: true },
    ],
    actuators: [
      { id: 1, name: 'Bomba de Riego', actuator_type: 'PUMP', pin: 'GPIO26', state: false },
      { id: 2, name: 'Oxigenador', actuator_type: 'OXYGENATOR', pin: 'GPIO27', state: true },
    ]
  },
  {
    id: 2, device_id: 'HYDRO-002', name: 'Módulo Ambiental', firmware_version: '1.8.0', active: true,
    sensors: [
      { id: 4, name: 'Temp. Ambiente', sensor_type: 'AIR_TEMP', unit: '°C', pin: 'GPIO14', active: true },
      { id: 5, name: 'Humedad Ambiente', sensor_type: 'HUMIDITY', unit: '%', pin: 'GPIO15', active: true },
      { id: 6, name: 'Nivel Tanque', sensor_type: 'WATER_LEVEL', unit: '%', pin: 'GPIO16', active: false },
    ],
    actuators: [
      { id: 3, name: 'Dosificador Nutes', actuator_type: 'DOSER', pin: 'GPIO28', state: false },
    ]
  }
];

const SENSOR_ICONS = {
  PH: { icon: 'fa-flask', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  EC: { icon: 'fa-bolt', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  WATER_TEMP: { icon: 'fa-thermometer-half', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  AIR_TEMP: { icon: 'fa-temperature-high', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  HUMIDITY: { icon: 'fa-tint', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  WATER_LEVEL: { icon: 'fa-water', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const ACTUATOR_ICONS = {
  PUMP: { icon: 'fa-faucet', color: '#10b981' },
  OXYGENATOR: { icon: 'fa-wind', color: '#38bdf8' },
  DOSER: { icon: 'fa-flask', color: '#8b5cf6' },
  FAN: { icon: 'fa-fan', color: '#f59e0b' },
};

function DeviceCard({ device }) {
  const si = device.sensors || [];
  const ai = device.actuators || [];

  return (
    <div className="glass-panel">
      <div className="panel-inner">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: device.active ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: device.active ? 'var(--primary)' : 'var(--text-dim)',
              border: `1px solid ${device.active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)'}`,
            }}>
              <i className="fas fa-microchip" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem' }}>{device.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>
                <i className="fas fa-fingerprint" style={{ marginRight: 4 }} />{device.device_id}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className={`badge ${device.active ? 'badge-ok' : 'badge-danger'}`}>
              {device.active ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>FW v{device.firmware_version}</span>
          </div>
        </div>

        {/* Sensors */}
        {si.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
              SENSORES ({si.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8, marginBottom: 16 }}>
              {si.map(sensor => {
                const sc = SENSOR_ICONS[sensor.sensor_type] || { icon: 'fa-microchip', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                return (
                  <div key={sensor.id} style={{
                    background: 'rgba(0,0,0,0.2)', borderRadius: 11, padding: '10px 12px',
                    border: `1px solid ${sensor.active ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.15)'}`,
                    opacity: sensor.active ? 1 : 0.5,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                        <i className={`fas ${sc.icon}`} />
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700 }}>{sensor.name}</div>
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>
                      <span>Pin: {sensor.pin || 'N/A'}</span>
                      <span style={{ marginLeft: 8 }}>Unidad: {sensor.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Actuators */}
        {ai.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 0.5, marginBottom: 10 }}>
              ACTUADORES ({ai.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ai.map(act => {
                const ac = ACTUATOR_ICONS[act.actuator_type] || { icon: 'fa-cog', color: '#94a3b8' };
                return (
                  <div key={act.id} className="actuator-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: act.state ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: act.state ? 'var(--primary)' : ac.color, fontSize: 14 }}>
                        <i className={`fas ${ac.icon}`} />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{act.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Pin: {act.pin || 'N/A'}</div>
                      </div>
                    </div>
                    <span className={`badge ${act.state ? 'badge-ok' : 'badge-warn'}`}>
                      {act.state ? 'ON' : 'OFF'}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DevicesPage() {
  const { devices } = useApp();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          Dispositivos IoT
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Controladores ESP32, sensores y actuadores registrados en la base de datos.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 18 }}>
        {devices.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '40px' }}>
            No hay dispositivos registrados en la nube.
          </div>
        ) : (
          devices.map(d => <DeviceCard key={d.id} device={d} />)
        )}
      </div>
    </div>
  );
}
