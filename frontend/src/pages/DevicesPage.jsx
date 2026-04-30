// src/pages/DevicesPage.jsx
// Vista de dispositivos IoT y sensores registrados en la base de datos

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createDevice, updateDevice, deleteDevice } from '../api/hydroApi';

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

function DeviceCard({ device, onEdit, onDelete }) {
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => onEdit(device)} style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11 }}>
              <i className="fas fa-edit" />
            </button>
            <button onClick={() => onDelete(device.id)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11 }}>
              <i className="fas fa-trash" />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <span className={`badge ${device.active ? 'badge-ok' : 'badge-danger'}`}>
              {device.active ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>FW v{device.firmware_version || '1.0.0'}</span>
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
  const { devices, selectedFarm, zones } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este dispositivo?')) return;
    try {
      await deleteDevice(id);
      alert('Dispositivo eliminado');
    } catch {
      alert('Error al eliminar dispositivo');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = {
      name: fd.get('name'),
      device_id: fd.get('device_id'),
      farm: selectedFarm?.id,
      zone: fd.get('zone') ? parseInt(fd.get('zone')) : null,
      active: true
    };

    setLoading(true);
    try {
      if (editingDevice) {
        await updateDevice(editingDevice.id, data);
      } else {
        await createDevice(data);
      }
      setShowModal(false);
      setEditingDevice(null);
    } catch {
      alert('Error al guardar dispositivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
            Dispositivos IoT
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Controladores ESP32, sensores y actuadores registrados en {selectedFarm?.name || 'la base de datos'}.
          </p>
        </div>
        <button 
          onClick={() => { setEditingDevice(null); setShowModal(true); }}
          className="btn-primary" 
          style={{ padding: '10px 20px', borderRadius: 12, fontWeight: 800 }}
        >
          <i className="fas fa-plus" style={{ marginRight: 8 }} /> NUEVO ESP32
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 18 }}>
        {devices.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', gridColumn: '1 / -1' }}>
            <i className="fas fa-microchip" style={{ fontSize: 40, marginBottom: 20, opacity: 0.2 }} />
            <p>No hay dispositivos registrados en esta finca.</p>
          </div>
        ) : (
          devices.map(d => (
            <DeviceCard 
              key={d.id} 
              device={d} 
              onEdit={(dev) => { setEditingDevice(dev); setShowModal(true); }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>
                {editingDevice ? 'Editar Dispositivo' : 'Nuevo Dispositivo ESP32'}
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>
                <i className="fas fa-times" />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>NOMBRE DEL DISPOSITIVO</label>
                <input 
                  name="name" 
                  defaultValue={editingDevice?.name || ''} 
                  required 
                  placeholder="Ej: Controlador Principal" 
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }} 
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>ID DEL DISPOSITIVO (FIRMWARE)</label>
                <input 
                  name="device_id" 
                  defaultValue={editingDevice?.device_id || ''} 
                  required 
                  placeholder="Ej: HYDRO-ESP32-01" 
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }} 
                />
              </div>

              <div style={{ marginBottom: 25 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>ASIGNAR A MÓDULO (OPCIONAL)</label>
                <select 
                  name="zone" 
                  defaultValue={editingDevice?.zone || ''}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}
                >
                  <option value="">Ninguno (General)</option>
                  {zones.map(z => <option key={z.id} value={z.id} style={{ background: '#0f172a' }}>{z.name}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 800 }}>
                {loading ? 'GUARDANDO...' : editingDevice ? 'ACTUALIZAR DISPOSITIVO' : 'REGISTRAR DISPOSITIVO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

