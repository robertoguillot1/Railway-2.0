import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getIrrigationRules, updateIrrigationRule, createIrrigationRule } from '../api/hydroApi';

export default function SettingsPage() {
  const { 
    irrigationThreshold, setIrrigationThreshold, 
    stopThreshold, setStopThreshold,
    systemPrefs, updateSystemPrefs,
    farms, devices
  } = useApp();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('automation');
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  // Cargar reglas reales
  useEffect(() => {
    if (activeTab === 'automation') {
      setLoadingRules(true);
      getIrrigationRules()
        .then(setRules)
        .catch(console.error)
        .finally(() => setLoadingRules(false));
    }
  }, [activeTab]);

  const handleToggleRule = async (ruleId, newState) => {
    try {
      await updateIrrigationRule(ruleId, { active: newState });
      setRules(prev => prev.map(r => r.id === ruleId ? { ...r, active: newState } : r));
    } catch (err) {
      alert('Error al actualizar la regla');
    }
  };

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
              {loadingRules ? (
                <div style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', padding: 20 }}>Cargando reglas...</div>
              ) : rules.length === 0 ? (
                <div style={{ color: 'var(--text-dim)', fontSize: 11, textAlign: 'center', padding: 20 }}>No hay reglas personalizadas.</div>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="actuator-card" style={{ marginBottom: 0 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{rule.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        Sensor: {rule.sensor_name || 'Desconocido'} | Umbral: {rule.min_threshold}%
                      </div>
                    </div>
                    <label className="switch">
                      <input 
                        type="checkbox" 
                        checked={rule.active} 
                        onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setShowRuleModal(true)}
              className="btn-primary" style={{ marginTop: 20, width: '100%', padding: '12px', fontSize: 12 }}
            >
              <i className="fas fa-plus" style={{ marginRight: 8 }} /> AÑADIR NUEVA REGLA
            </button>
          </div>
        </div>
      )}

      {showRuleModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>Nueva Regla de Riego</div>
              <button onClick={() => setShowRuleModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              try {
                const newRule = await createIrrigationRule({
                  name: fd.get('name'),
                  min_threshold: fd.get('min'),
                  sensor: fd.get('sensor'),
                  zone: fd.get('zone'),
                  active: true
                });
                setRules(p => [...p, newRule]);
                setShowRuleModal(false);
              } catch { alert('Error al crear regla'); }
            }}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>NOMBRE REGLA</label>
                <input name="name" required style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>HUMEDAD MÍNIMA (%)</label>
                <input name="min" type="number" required style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: 10 }}>GUARDAR REGLA</button>
            </form>
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
                  <select 
                    value={systemPrefs.tempUnit}
                    onChange={(e) => updateSystemPrefs({ tempUnit: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}
                  >
                    <option>Celsius (°C)</option>
                    <option>Fahrenheit (°F)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>Conductividad</span>
                  <select 
                    value={systemPrefs.condUnit}
                    onChange={(e) => updateSystemPrefs({ condUnit: e.target.value })}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}
                  >
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
                    <input 
                      type="checkbox" 
                      checked={systemPrefs.criticalAlerts}
                      onChange={(e) => updateSystemPrefs({ criticalAlerts: e.target.checked })}
                    />
                    <span className="switch-slider" />
                  </label>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13 }}>Sonido de Terminal</span>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={systemPrefs.terminalSound}
                      onChange={(e) => updateSystemPrefs({ terminalSound: e.target.checked })}
                    />
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
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #059669)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, boxShadow: '0 8px 20px var(--primary-glow)' }}>
            <i className="fas fa-user" />
          </div>
          <h2 style={{ fontSize: 20, marginBottom: 5 }}>{user?.full_name || user?.username}</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 30 }}>
            {user?.is_admin ? 'Administrador de Sistema' : 'Operador de Sistema'}
          </p>
          
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 25, display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 30 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{devices?.length || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Dispositivos</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{farms?.length || 0}</div>
              <div style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase' }}>Fincas</div>
            </div>
          </div>

          <button 
            onClick={() => alert('Función de edición de perfil en desarrollo...')}
            className="btn-primary" style={{ maxWidth: 200, margin: '0 auto' }}
          >
            <i className="fas fa-edit" style={{ marginRight: 8 }} /> EDITAR PERFIL
          </button>
        </div>
      )}
    </div>
  );
}
