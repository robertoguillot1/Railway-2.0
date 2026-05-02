import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { 
  getIrrigationRules, updateIrrigationRule, createIrrigationRule, 
  updateProfile, deleteFarm, updateFarm,
  getCropTypes, createCropType, updateCropType, deleteCropType
} from '../api/hydroApi';

export default function SettingsPage() {
  const { 
    irrigationThreshold, setIrrigationThreshold, 
    stopThreshold, setStopThreshold,
    systemPrefs, updateSystemPrefs,
    farms, setFarms, devices, zones, selectedFarm, setSelectedFarm,
    setShowOnboarding, setOnboardingType
  } = useApp();
  const { user, login } = useAuth();
  
  const [activeTab, setActiveTab] = useState('automation');
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropForm, setCropForm] = useState({ name: '', duration_days: 30, icon: 'fa-seedling' });

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
    if (activeTab === 'crops') {
      setLoading(true);
      getCropTypes()
        .then(setCrops)
        .catch(console.error)
        .finally(() => setLoading(false));
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
          { id: 'farms', label: 'Fincas', icon: 'fa-tractor' },
          { id: 'crops', label: 'Cultivos', icon: 'fa-seedling' }
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
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30' }}>
            <div style={{ height: 6, background: 'linear-gradient(90deg, #10b981, #0d9488)' }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: 18 }}>
                  <i className="fas fa-gauge-high" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15 }}>Parámetros de Riego</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Umbrales de activación automática</div>
                </div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '18px 20px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Umbral de Riego Crítico</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800, fontFamily: 'Outfit', fontSize: 16 }}>{irrigationThreshold}%</span>
                </div>
                <input type="range" className="range-slider" min={10} max={60} value={irrigationThreshold} onChange={(e) => setIrrigationThreshold(Number(e.target.value))} />
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>La bomba se activa si la humedad baja de este valor.</p>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '18px 20px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Umbral de Saturación</span>
                  <span style={{ color: '#f59e0b', fontWeight: 800, fontFamily: 'Outfit', fontSize: 16 }}>{stopThreshold}%</span>
                </div>
                <input type="range" className="range-slider" min={65} max={100} value={stopThreshold} onChange={(e) => setStopThreshold(Number(e.target.value))} />
                <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>El riego se detiene al alcanzar este nivel.</p>
              </div>
            </div>
          </div>
          {/* Rules Card */}
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30' }}>
            <div style={{ height: 6, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontSize: 18 }}>
                  <i className="fas fa-list-check" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15 }}>Reglas de Actuación</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Automatizaciones personalizadas</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {loadingRules ? (
                  <div style={{ color: 'var(--text-dim)', fontSize: 12, textAlign: 'center', padding: 30 }}><i className="fas fa-circle-notch fa-spin" style={{ marginRight: 8 }} />Cargando reglas...</div>
                ) : rules.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, background: 'rgba(0,0,0,0.15)', borderRadius: 14 }}>
                    <i className="fas fa-wand-magic-sparkles" style={{ fontSize: 24, color: 'var(--text-dim)', opacity: 0.3, marginBottom: 10, display: 'block' }} />
                    <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>Sin reglas personalizadas aún</div>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{rule.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Sensor: {rule.sensor_name || 'Desconocido'} · Umbral: {rule.min_threshold}%</div>
                      </div>
                      <label className="switch"><input type="checkbox" checked={rule.active} onChange={(e) => handleToggleRule(rule.id, e.target.checked)} /><span className="switch-slider" /></label>
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowRuleModal(true)} className="btn-primary" style={{ marginTop: 20, width: '100%', padding: '12px', fontSize: 12, borderRadius: 14 }}>
                <i className="fas fa-plus" style={{ marginRight: 8 }} /> AÑADIR NUEVA REGLA
              </button>
            </div>
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
                    <option value="" style={{ background: '#0f172a', color: 'white' }}>Seleccionar...</option>
                    {useApp().zones.map(z => <option key={z.id} value={z.id} style={{ background: '#0f172a', color: 'white' }}>{z.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>SENSOR DE HUMEDAD</label>
                  <select name="sensor" required style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13 }}>
                    <option value="" style={{ background: '#0f172a', color: 'white' }}>Seleccionar...</option>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Unidades de Medida */}
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30' }}>
            <div style={{ height: 6, background: 'linear-gradient(90deg, #38bdf8, #6366f1)' }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: 18 }}>
                  <i className="fas fa-ruler-combined" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15 }}>Unidades de Medida</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Formato de datos en la plataforma</div>
                </div>
              </div>
              {[
                { label: 'Temperatura', icon: 'fa-temperature-half', color: '#ef4444', key: 'tempUnit', opts: ['Celsius (°C)', 'Fahrenheit (°F)'] },
                { label: 'Conductividad', icon: 'fa-bolt', color: '#f59e0b', key: 'condUnit', opts: ['mS/cm', 'PPM (500 scale)'] },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 14, marginBottom: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <i className={`fas ${item.icon}`} style={{ color: item.color, fontSize: 16, width: 20 }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                  </div>
                  <select value={systemPrefs[item.key]} onChange={e => updateSystemPrefs({ [item.key]: e.target.value })} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    {item.opts.map(o => <option key={o} style={{ background: '#1a2235' }}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
          {/* Notificaciones */}
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30' }}>
            <div style={{ height: 6, background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: 18 }}>
                  <i className="fas fa-bell" />
                </div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15 }}>Notificaciones</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Controla las alertas del sistema</div>
                </div>
              </div>
              {[
                { label: 'Alertas Críticas', desc: 'Avisos de temperatura y humedad fuera de rango', key: 'criticalAlerts', color: '#ef4444' },
                { label: 'Sonido de Terminal', desc: 'Retroalimentación auditiva en acciones', key: 'terminalSound', color: '#38bdf8' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: 14, marginBottom: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>{item.desc}</div>
                  </div>
                  <label className="switch"><input type="checkbox" checked={systemPrefs[item.key]} onChange={e => updateSystemPrefs({ [item.key]: e.target.checked })} /><span className="switch-slider" /></label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ height: 120, background: 'linear-gradient(135deg, #10b981, #059669, #0d9488)', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>
          <div style={{ padding: '0 32px 32px', textAlign: 'center', marginTop: -50, position: 'relative', zIndex: 10 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontFamily: 'Outfit', fontWeight: 800, color: 'white', border: '4px solid #141e30', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
              {(user?.full_name || user?.username || '?')[0].toUpperCase()}
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{user?.full_name || user?.username}</h2>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: user?.is_admin ? 'rgba(139,92,246,0.15)' : 'rgba(56,189,248,0.15)', padding: '4px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: user?.is_admin ? '#c4b5fd' : '#38bdf8', marginBottom: 24 }}>
              <i className={`fas ${user?.is_admin ? 'fa-crown' : 'fa-user'}`} style={{ fontSize: 10 }} />
              {user?.is_admin ? 'Administrador' : 'Operador'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { val: devices?.length || 0, label: 'DISPOSITIVOS', color: '#38bdf8' },
                { val: farms?.length || 0, label: 'FINCAS', color: '#10b981' },
                { val: zones?.length || 0, label: 'MÓDULOS', color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '14px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowProfileModal(true)} className="btn-primary" style={{ maxWidth: 220, margin: '0 auto', borderRadius: 14 }}>
              <i className="fas fa-pen-to-square" style={{ marginRight: 8 }} /> EDITAR PERFIL
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ height: 6, background: 'linear-gradient(90deg, #8b5cf6, #6366f1)' }} />
          <div style={{ padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontSize: 22 }}>
                <i className="fas fa-shield-halved" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17 }}>Seguridad</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Protege el acceso a tu cuenta</div>
              </div>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#c4b5fd', marginBottom: 24, marginTop: 20 }}>
              <i className="fas fa-info-circle" style={{ marginRight: 8 }} />
              Actualiza tu contraseña periódicamente para mantener tu instalación segura.
            </div>
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
              } catch (err) { alert('Error al actualizar contraseña'); }
              finally { setLoading(false); }
            }}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>NUEVA CONTRASEÑA</label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 13 }} />
                  <input name="p1" type="password" required style={{ width: '100%', padding: '13px 13px 13px 40px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 25 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 8, letterSpacing: 1 }}>CONFIRMAR CONTRASEÑA</label>
                <div style={{ position: 'relative' }}>
                  <i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 13 }} />
                  <input name="p2" type="password" required style={{ width: '100%', padding: '13px 13px 13px 40px', borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 13 }} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 14, fontWeight: 800 }}>
                {loading ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'farms' && (() => {
        const FARM_COLORS = [
          { from: '#10b981', to: '#059669', glow: 'rgba(16,185,129,0.3)' },
          { from: '#6366f1', to: '#4f46e5', glow: 'rgba(99,102,241,0.3)' },
          { from: '#f59e0b', to: '#d97706', glow: 'rgba(245,158,11,0.3)' },
          { from: '#ef4444', to: '#dc2626', glow: 'rgba(239,68,68,0.3)' },
          { from: '#8b5cf6', to: '#7c3aed', glow: 'rgba(139,92,246,0.3)' },
          { from: '#38bdf8', to: '#0ea5e9', glow: 'rgba(56,189,248,0.3)' },
        ];
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Mis Instalaciones</h2>
                <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>Gestiona y organiza todas tus fincas hidropónicas.</p>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 12, padding: '8px 18px', fontSize: 13, fontWeight: 700, color: 'var(--primary)', fontFamily: 'Outfit' }}>
                <i className="fas fa-seedling" style={{ marginRight: 8 }} />{farms.length} Registradas
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {farms.map((f, idx) => {
                const palette = FARM_COLORS[idx % FARM_COLORS.length];
                const initials = f.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const zoneCount = zones.filter(z => z.farm === f.id).length;
                const devCount = devices.filter(d => d.farm === f.id).length;
                return (
                  <div key={f.id}
                    style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#141e30', transition: 'transform 0.25s, box-shadow 0.25s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${palette.glow}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ height: 100, background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '16px 20px' }}>
                      <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: 1 }}>
                        {initials}
                      </div>
                      <div style={{ position: 'absolute', top: 12, right: 12 }}>
                        <button
                          onClick={() => handleDeleteFarm(f.id)}
                          style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: 12, transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.7)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                        ><i className="fas fa-trash-alt" /></button>
                      </div>
                    </div>
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, marginBottom: 5 }}>{f.name}</div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                        <i className="fas fa-location-dot" style={{ color: palette.from, fontSize: 11 }} />
                        {f.location || 'Sin ubicación registrada'}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {[{ val: zoneCount, label: 'MÓDULOS' }, { val: devCount, label: 'EQUIPOS' }, { val: '✓', label: 'ACTIVA' }].map(stat => (
                          <div key={stat.label} style={{ flex: 1, borderRadius: 12, padding: '10px 8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800, color: palette.from }}>{stat.val}</div>
                            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginTop: 2 }}>{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div
                onClick={() => { setShowOnboarding(true); setOnboardingType('abbreviated'); }}
                style={{ borderRadius: 20, border: '2px dashed rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.03)', minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.03)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--primary)' }}>
                  <i className="fas fa-plus" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--primary)', marginBottom: 4 }}>Nueva Instalación</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Registrar una nueva finca</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'crops' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800 }}>Catálogo de Cultivos</h2>
            <button 
              onClick={() => { setEditingCrop(null); setCropForm({ name: '', duration_days: 30, icon: 'fa-seedling' }); setShowCropModal(true); }}
              className="btn-primary" style={{ borderRadius: 12, padding: '10px 20px', fontSize: 12 }}
            >
              <i className="fas fa-plus" style={{ marginRight: 8 }} /> NUEVO CULTIVO
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 15 }}>
            {crops.map(c => (
              <div key={c.id} className="glass-panel" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: 20 }}>
                    <i className={`fas ${c.icon || 'fa-seedling'}`} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      onClick={() => { setEditingCrop(c); setCropForm({ name: c.name, duration_days: c.duration_days, icon: c.icon }); setShowCropModal(true); }}
                      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(56,189,248,0.1)', color: '#38bdf8', cursor: 'pointer' }}
                    ><i className="fas fa-pen" style={{ fontSize: 10 }} /></button>
                    <button 
                      onClick={async () => {
                        if(confirm(`¿Eliminar ${c.name}?`)) {
                          try {
                            await deleteCropType(c.id);
                            setCrops(prev => prev.filter(x => x.id !== c.id));
                          } catch { alert('Error al eliminar. Verifique si el cultivo está en uso.'); }
                        }
                      }}
                      style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer' }}
                    ><i className="fas fa-trash" style={{ fontSize: 10 }} /></button>
                  </div>
                </div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-clock" style={{ fontSize: 10 }} />
                  Ciclo estimado: {c.duration_days} días
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>
                {editingCrop ? 'Editar Cultivo' : 'Nuevo Cultivo'}
              </div>
              <button onClick={() => setShowCropModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>
                <i className="fas fa-times" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                if (editingCrop) {
                  const updated = await updateCropType(editingCrop.id, cropForm);
                  setCrops(prev => prev.map(x => x.id === editingCrop.id ? updated : x));
                } else {
                  const created = await createCropType(cropForm);
                  setCrops(prev => [...prev, created]);
                }
                setShowCropModal(false);
              } catch (err) { alert('Error al guardar cultivo'); }
              finally { setLoading(false); }
            }}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6, letterSpacing: 1 }}>NOMBRE DEL CULTIVO</label>
                <input 
                  required value={cropForm.name}
                  onChange={e => setCropForm({...cropForm, name: e.target.value})}
                  placeholder="Ej: Lechuga Crespa"
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6, letterSpacing: 1 }}>DURACIÓN DEL CICLO (DÍAS)</label>
                <input 
                  type="number" required value={cropForm.duration_days}
                  onChange={e => setCropForm({...cropForm, duration_days: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} 
                />
              </div>
              <div style={{ marginBottom: 25 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: 6, letterSpacing: 1 }}>ICONO (FontAwesome)</label>
                <select 
                  value={cropForm.icon}
                  onChange={e => setCropForm({...cropForm, icon: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <option value="fa-seedling" style={{ background: '#0f172a', color: 'white' }}>Plántula</option>
                  <option value="fa-leaf" style={{ background: '#0f172a', color: 'white' }}>Hoja</option>
                  <option value="fa-apple-whole" style={{ background: '#0f172a', color: 'white' }}>Fruto</option>
                  <option value="fa-carrot" style={{ background: '#0f172a', color: 'white' }}>Zanahoria</option>
                  <option value="fa-pepper-hot" style={{ background: '#0f172a', color: 'white' }}>Ají/Pimiento</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: 12 }}>
                {loading ? 'GUARDANDO...' : 'GUARDAR CULTIVO'}
              </button>
            </form>
          </div>
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
