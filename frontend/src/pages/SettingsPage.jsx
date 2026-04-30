import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { 
  getIrrigationRules, updateIrrigationRule, createIrrigationRule, 
  updateProfile, deleteFarm, updateFarm 
} from '../api/hydroApi';

export default function SettingsPage() {
  const { 
    irrigationThreshold, setIrrigationThreshold, 
    stopThreshold, setStopThreshold,
    systemPrefs, updateSystemPrefs,
    farms, setFarms, devices, selectedFarm, setSelectedFarm
  } = useApp();
  const { user, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('automation');
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await updateProfile(profileForm);
      // Actualizar el contexto de Auth (si login() maneja la actualización del user)
      // Dependiendo de cómo esté AuthContext, podríamos necesitar un setAuthUser
      alert('Perfil actualizado con éxito. Por favor, refresca para ver los cambios.');
      setShowProfileModal(false);
    } catch {
      alert('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFarm = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta instalación? Se borrarán todos sus módulos y dispositivos asociados.')) return;
    try {
      const res = await deleteFarm(id);
      if (res && res.error) throw new Error(res.error);
      
      const updatedFarms = farms.filter(f => f.id !== id);
      setFarms(updatedFarms);
      if (selectedFarm?.id === id) {
        setSelectedFarm(updatedFarms[0] || null);
      }
      alert('Instalación eliminada correctamente.');
    } catch (err) { 
      console.error('[HYDRO] Error deleting farm:', err);
      alert('No se pudo eliminar la finca. Verifica que no tenga dispositivos vinculados activamente o intenta refrescar la página.'); 
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
      <div style={{ display: 'flex', gap: 10, marginBottom: 30, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 15 }}>
        {[
          { id: 'automation', label: 'Automatización', icon: 'fa-robot' },
          { id: 'system', label: 'Sistema', icon: 'fa-cog' },
          { id: 'profile', label: 'Perfil', icon: 'fa-user-circle' },
          { id: 'security', label: 'Seguridad', icon: 'fa-shield-halved' },
          { id: 'farms', label: 'Fincas', icon: 'fa-tractor' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: 'transparent', border: 'none',
              color: activeTab === t.id ? 'var(--primary)' : 'var(--text-dim)',
              fontWeight: 800, fontSize: 12, letterSpacing: 0.5,
              cursor: 'pointer', padding: '8px 16px', borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.3s',
              background: activeTab === t.id ? 'rgba(16,185,129,0.08)' : 'transparent',
            }}
          >
            <i className={`fas ${t.icon}`} style={{ fontSize: 14 }} />
            {t.label.toUpperCase()}
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
              <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>Nueva Regla de Automatización</div>
              <button onClick={() => setShowRuleModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              setLoading(true);
              try {
                const newRule = await createIrrigationRule({
                  name: fd.get('name'),
                  min_threshold: fd.get('min'),
                  sensor: parseInt(fd.get('sensor')),
                  zone: parseInt(fd.get('zone')),
                  active: true
                });
                setRules(p => [...p, newRule]);
                setShowRuleModal(false);
                alert('Regla creada con éxito');
              } catch (err) { 
                console.error(err);
                alert('Error al crear regla. Asegúrate de seleccionar zona y sensor.'); 
              } finally {
                setLoading(false);
              }
            }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>NOMBRE DE LA REGLA</label>
                <input name="name" required placeholder="Ej: Riego de Emergencia" style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 18 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>MÓDULO (ZONA)</label>
                  <select name="zone" required style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}>
                    <option value="">Seleccionar...</option>
                    {useApp().zones.map(z => <option key={z.id} value={z.id} style={{ background: '#0f172a' }}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>SENSOR DE HUMEDAD</label>
                  <select name="sensor" required style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}>
                    <option value="">Seleccionar...</option>
                    {devices.filter(d => d.device_type === 'SENSOR' || d.sensors?.length > 0).map(d => (
                      <optgroup key={d.id} label={d.name} style={{ background: '#0f172a' }}>
                        {d.sensors?.map(s => <option key={s.id} value={s.id}>{s.name} ({s.sensor_type})</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 25 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>HUMEDAD MÍNIMA (%)</label>
                <input name="min" type="number" min="0" max="100" required style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }} />
              </div>
              
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 800 }}>
                {loading ? 'PROCESANDO...' : 'GUARDAR REGLA DE AUTOMATIZACIÓN'}
              </button>
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
            onClick={() => setShowProfileModal(true)}
            className="btn-primary" style={{ maxWidth: 200, margin: '0 auto' }}
          >
            <i className="fas fa-edit" style={{ marginRight: 8 }} /> EDITAR PERFIL
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-panel" style={{ padding: 30, maxWidth: 500, margin: '0 auto' }}>
          <div className="panel-header" style={{ marginBottom: 25 }}>
            <i className="fas fa-shield-halved" /> Seguridad de la Cuenta
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 25 }}>
            Actualiza tu contraseña periódicamente para mantener tu instalación segura.
          </p>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const p1 = fd.get('p1');
            const p2 = fd.get('p2');
            if (p1 !== p2) return alert('Las contraseñas no coinciden');
            if (p1.length < 6) return alert('La contraseña debe tener al menos 6 caracteres');
            
            setLoading(true);
            try {
              const { changePassword } = await import('../api/hydroApi');
              await changePassword(p1);
              alert('Contraseña actualizada con éxito');
              e.target.reset();
            } catch (err) {
              alert('Error al actualizar contraseña');
            } finally {
              setLoading(false);
            }
          }}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>NUEVA CONTRASEÑA</label>
              <input name="p1" type="password" required style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div style={{ marginBottom: 25 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8 }}>CONFIRMAR CONTRASEÑA</label>
              <input name="p2" type="password" required style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12, fontWeight: 800 }}>
              {loading ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'farms' && (
        <div className="glass-panel" style={{ padding: 30 }}>
          <div className="panel-header" style={{ marginBottom: 25, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><i className="fas fa-tractor" /> Gestión de Instalaciones</span>
            <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 20 }}>{farms.length} Registradas</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 }}>
            {farms.map(f => (
              <div key={f.id} className="actuator-card" style={{ 
                margin: 0, padding: 20, flexDirection: 'column', alignItems: 'flex-start', 
                gap: 15, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' 
              }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <i className="fas fa-farm" />
                  </div>
                  <button 
                    onClick={() => handleDeleteFarm(f.id)}
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', width: 32, height: 32, borderRadius: 10, cursor: 'pointer', transition: 'all 0.3s' }}
                    title="Eliminar Instalación"
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'Outfit', marginBottom: 4 }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="fas fa-location-dot" style={{ fontSize: 10 }} />
                    {f.location || 'Sin ubicación registrada'}
                  </div>
                </div>

                <div style={{ width: '100%', paddingTop: 15, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 15 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    <b style={{ color: 'white' }}>{zones.filter(z => z.farm === f.id).length}</b> ZONAS
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    <b style={{ color: 'white' }}>{devices.filter(d => d.farm === f.id).length}</b> EQ.
                  </div>
                </div>
              </div>
            ))}
          </div>

          {farms.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              <i className="fas fa-folder-open" style={{ fontSize: 30, marginBottom: 15, opacity: 0.3 }} />
              <p fontSize={13}>No tienes instalaciones registradas aún.</p>
            </div>
          )}
        </div>
      )}

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>Editar Perfil</div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>NOMBRE</label>
                <input 
                  value={profileForm.first_name}
                  onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>APELLIDO</label>
                <input 
                  value={profileForm.last_name}
                  onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>EMAIL</label>
                <input 
                  type="email"
                  value={profileForm.email}
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
