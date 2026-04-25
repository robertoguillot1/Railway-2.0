// src/pages/ZonesPage.jsx
// Vista de zonas hidropónicas con gestión CRUD completa

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { deleteZone, createZone, updateZone } from '../api/hydroApi';
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
  const { zones, setZones, addLog, farms } = useApp();
  const [loading, setLoading] = useState(false);

  const handleAddZone = async () => {
    const name = prompt('Nombre del nuevo módulo (Ej: Modulo F6):');
    if (!name) return;
    const code = name.toLowerCase().replace(/\s+/g, '-');
    
    try {
      setLoading(true);
      const newZone = await createZone({ 
        name, 
        code, 
        farm: farms[0]?.id || 1, // Usar la primera granja disponible
        current_stage: 'GERMINATION',
        active: true,
        start_date: new Date().toISOString().split('T')[0]
      });
      setZones(prev => [...prev, newZone]);
      addLog(`✅ NUBE: Módulo "${name}" creado exitosamente.`);
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
            Gestiona tus zonas de cultivo, añade nuevos módulos o edita los existentes.
          </p>
        </div>
        <button 
          onClick={handleAddZone}
          disabled={loading}
          style={{ 
            padding: '10px 20px', borderRadius: 12, background: 'var(--primary)', 
            border: 'none', color: '#0f1520', fontWeight: 800, fontSize: 12, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 15px var(--primary-glow)', opacity: loading ? 0.7 : 1
          }}
        >
          <i className="fas fa-plus" />
          AÑADIR MÓDULO
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
        {zones.length === 0 ? (
          <div style={{ gridColumn: '1/-1', color: 'var(--text-dim)', textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <i className="fas fa-seedling" style={{ fontSize: 40, marginBottom: 16, display: 'block', opacity: 0.3 }} />
            No hay zonas registradas. ¡Crea tu primera zona arriba!
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
