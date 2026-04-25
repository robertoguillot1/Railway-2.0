// src/pages/SettingsPage.jsx
// Gestión de configuraciones, reglas de automatización y preferencias

import { useApp } from '../context/AppContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { irrigationThreshold, setIrrigationThreshold, stopThreshold, setStopThreshold } = useApp();
  const [activeTab, setActiveTab] = useState('automation');

  return (
    <div className="page-container" style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: 30 }}>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', marginBottom: 8, letterSpacing: '-0.5px' }}>
          Configuración
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
          Gestiona las reglas de tu ecosistema hidropónico y personaliza la interfaz.
        </p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 15, marginBottom: 25, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 15 }}>
        {['automation', 'system', 'profile'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-dim)',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: '5px 10px',
              position: 'relative',
              transition: 'all 0.3s'
            }}
          >
            {tab === 'automation' ? 'Automatización' : tab === 'system' ? 'Sistema' : 'Perfil'}
            {activeTab === tab && (
              <div style={{ position: 'absolute', bottom: -16, left: 0, right: 0, height: 2, background: 'var(--primary)', borderRadius: 2 }} />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'automation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20 }}>
          {/* Thresholds Card */}
          <div className="glass-panel" style={{ padding: 25 }}>
            <div className="panel-header" style={{ marginBottom: 20 }}>
              <i className="fas fa-robot" /> Parámetros Globales de Riego
            </div>
            
            <div style={{ marginBottom: 25 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Umbral de Riego Crítico</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{irrigationThreshold}%</span>
              </div>
              <input 
                type="range" className="range-slider" min={10} max={60} 
                value={irrigationThreshold} 
                onChange={(e) => setIrrigationThreshold(Number(e.target.value))}
              />
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
                La bomba se activará automáticamente si la humedad baja de este valor.
              </p>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Umbral de Parado (Saturación)</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{stopThreshold}%</span>
              </div>
              <input 
                type="range" className="range-slider" min={65} max={100} 
                value={stopThreshold} 
                onChange={(e) => setStopThreshold(Number(e.target.value))}
              />
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
                El riego se detendrá cuando la humedad alcance este nivel para evitar asfixia radicular.
              </p>
            </div>
          </div>

          {/* Rules Card */}
          <div className="glass-panel" style={{ padding: 25 }}>
            <div className="panel-header" style={{ marginBottom: 20 }}>
              <i className="fas fa-list-check" /> Reglas de Actuación
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Oxigenación Nocturna', desc: 'Activar aireador cada 2 horas por 15 min', active: true },
                { name: 'Control de pH', desc: 'Dosificar solución ácida si pH > 6.8', active: false },
                { name: 'Enfriamiento de Solución', desc: 'Activar ventiladores si Temp > 28°C', active: true }
              ].map((rule, i) => (
                <div key={i} className="actuator-card" style={{ marginBottom: 0 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{rule.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{rule.desc}</div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked={rule.active} />
                    <span className="switch-slider" />
                  </label>
                </div>
              ))}
            </div>
            
            <button className="btn-primary" style={{ marginTop: 20, width: '100%', padding: '12px', fontSize: 12 }}>
              <i className="fas fa-plus" style={{ marginRight: 8 }} /> AÑADIR NUEVA REGLA
            </button>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="glass-panel" style={{ padding: 25 }}>
          <div className="panel-header" style={{ marginBottom: 20 }}>
            <i className="fas fa-microchip" /> Preferencias del Sistema
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <h4 style={{ fontSize: 12, marginBottom: 15, color: 'var(--primary)' }}>UNIDADES DE MEDIDA</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>Temperatura</span>
                  <select style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '5px 10px', borderRadius: 6 }}>
                    <option>Celsius (°C)</option>
                    <option>Fahrenheit (°F)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>Conductividad</span>
                  <select style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '5px 10px', borderRadius: 6 }}>
                    <option>mS/cm</option>
                    <option>PPM (500 scale)</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 12, marginBottom: 15, color: 'var(--primary)' }}>NOTIFICACIONES</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>Alertas Críticas</span>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="switch-slider" />
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>Sonido de Terminal</span>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="switch-slider" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--grad-primary)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            <i className="fas fa-user" />
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 5 }}>Roberto Guillot</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 30 }}>Administrador de Sistema</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 25, display: 'flex', justifyContent: 'center', gap: 40 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>12</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Dispositivos</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>3</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fincas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
