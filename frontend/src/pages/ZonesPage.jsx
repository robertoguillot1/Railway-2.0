import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { deleteZone, createZone, updateZone, getCropTypes } from '../api/hydroApi';
import { STAGE_DISPLAY } from '../utils/helpers';

function ZoneCard({ zone, onDelete, onToggle }) {
  const stage = STAGE_DISPLAY[zone.current_stage] || { label: 'Crecimiento', icon: 'fa-leaf', color: '#10b981' };
  const progress = Math.min((zone.current_day / (zone.crop_type?.duration_days || 30)) * 100, 100);

  return (
    <div className="glass-panel" style={{ opacity: zone.active ? 1 : 0.6, position: 'relative' }}>
      <div className="panel-inner">
        {/* Actions Floating */}
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
          <button 
            onClick={() => onToggle(zone.id, !zone.active)}
            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', fontSize: 10 }}
            title={zone.active ? 'Desactivar' : 'Activar'}
          >
            <i className={`fas ${zone.active ? 'fa-eye-slash' : 'fa-eye'}`} />
          </button>
          <button 
            onClick={() => { if(confirm('¿Eliminar este módulo definitivamente?')) onDelete(zone.id) }}
            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', cursor: 'pointer', fontSize: 10 }}
            title="Eliminar"
          >
            <i className="fas fa-trash" />
          </button>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 18, paddingRight: 60 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{zone.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>
            <i className="fas fa-qrcode" style={{ marginRight: 5 }} />{zone.code}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span className="badge" style={{ background: `${stage.color}20`, color: stage.color }}>
            <i className={`fas ${stage.icon}`} /> {stage.label}
          </span>
          <span className={`badge ${zone.active ? 'badge-ok' : 'badge-danger'}`}>
            {zone.active ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>

        {/* Crop Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 11, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>CULTIVO</div>
            <div style={{ fontSize: 12, fontWeight: 700 }}>{zone.crop_type?.name || 'Sin cultivo'}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 11, padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>DÍA DEL CICLO</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: stage.color }}>
              Día {zone.current_day || 0} / {zone.crop_type?.duration_days || 30}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-dim)', marginBottom: 6, letterSpacing: 0.5 }}>
            <span>PROGRESO DEL CICLO</span>
            <span style={{ color: stage.color }}>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)` }} />
          </div>
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 10 }}>
          <i className="fas fa-calendar" style={{ marginRight: 6 }} />
          Inicio: {zone.start_date || '—'}
        </div>
      </div>
    </div>
  );
}

export default function ZonesPage() {
  const { zones, setZones, addLog, farms, selectedFarm } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cropTypes, setCropTypes] = useState([]);
  const [form, setForm] = useState({
    name: '',
    crop_type: '',
    start_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    getCropTypes().then(setCropTypes).catch(console.error);
  }, []);

  const handleAddZone = async (e) => {
    e.preventDefault();
    if (!form.name || !form.crop_type) return alert('Por favor completa todos los campos');
    
    const code = form.name.toLowerCase().replace(/\s+/g, '-');
    const farmId = selectedFarm?.id || farms[0]?.id;
    
    if (!farmId) return alert('No hay ninguna finca seleccionada.');

    try {
      setLoading(true);
      const newZone = await createZone({ 
        name: form.name, 
        code, 
        farm: farmId,
        crop_type: parseInt(form.crop_type),
        current_stage: 'GERMINATION',
        active: true,
        start_date: form.start_date
      });
      setZones(prev => [...prev, newZone]);
      addLog(`✅ NUBE: Módulo "${form.name}" creado exitosamente.`);
      setShowModal(false);
      setForm({ name: '', crop_type: '', start_date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      alert('Error al crear módulo. Verifica la conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteZone(id);
      setZones(prev => prev.filter(z => z.id !== id));
      addLog(`🗑️ NUBE: Módulo eliminado.`);
    } catch (err) {
      console.error('Error al eliminar zona:', err);
      alert('No se pudo eliminar el módulo.');
    }
  };

  const handleToggle = async (id, active) => {
    try {
      await updateZone(id, { active });
      setZones(prev => prev.map(z => z.id === id ? { ...z, active } : z));
      addLog(`👁️ NUBE: Estado de módulo actualizado.`);
    } catch (err) {
      alert('No se pudo actualizar el estado.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
            Módulos Hidropónicos
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Gestiona tus zonas de cultivo en <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedFarm?.name || 'la instalación'}</span>.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ 
            padding: '10px 20px', borderRadius: 12, background: 'var(--primary)', 
            border: 'none', color: '#0f1520', fontWeight: 800, fontSize: 12, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 15px var(--primary-glow)'
          }}
        >
          <i className="fas fa-plus" />
          AÑADIR MÓDULO
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 450 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit' }}>Nuevo Módulo</div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 18 }}>
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleAddZone}>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>NOMBRE DEL MÓDULO</label>
                <input 
                  type="text" required placeholder="Ej: Zona A-1"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>TIPO DE CULTIVO</label>
                <select 
                  required
                  value={form.crop_type}
                  onChange={e => setForm({...form, crop_type: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                >
                  <option value="" disabled>Selecciona un cultivo</option>
                  {cropTypes.map(c => <option key={c.id} value={c.id} style={{ background: '#0f172a' }}>{c.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 25 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, display: 'block', marginBottom: 8 }}>FECHA DE INICIO</label>
                <input 
                  type="date" required
                  value={form.start_date}
                  onChange={e => setForm({...form, start_date: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                />
              </div>

              <button 
                type="submit" disabled={loading}
                style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'var(--primary)', border: 'none', color: '#0f1520', fontWeight: 800, cursor: 'pointer' }}
              >
                {loading ? 'CREANDO...' : 'CREAR MÓDULO HIDROPÓNICO'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {zones.length === 0 ? (
          <div style={{ gridColumn: '1/-1', color: 'var(--text-dim)', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <i className="fas fa-seedling" style={{ fontSize: 40, marginBottom: 16, display: 'block', opacity: 0.3 }} />
            No hay zonas registradas para esta finca.
          </div>
        ) : (
          zones.map(zone => (
            <ZoneCard 
              key={zone.id} 
              zone={zone} 
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}
