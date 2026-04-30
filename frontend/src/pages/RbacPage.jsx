// src/pages/RbacPage.jsx
// Panel de administración RBAC — Roles, Recursos y Permisos

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../api/hydroApi';

const ICON_MAP = {
  'fa-th-large': '⊞', 'fa-layer-group': '⊟', 'fa-microchip': '⬡',
  'fa-chart-line': '◈', 'fa-bell': '◎', 'fa-cog': '⚙', 'fa-users-cog': '⊕',
};

function RolBadge({ nombre, estado }) {
  const colors = {
    'Administrador': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    'Operador':      { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
    'Visualizador':  { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
  };
  const c = colors[nombre] || { bg: 'rgba(16,185,129,0.15)', color: '#10b981' };
  return (
    <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, opacity: estado ? 1 : 0.5 }}>
      {nombre}
    </span>
  );
}

export default function RbacPage() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [recursos, setRecursos] = useState([]);
  const [usuarioRoles, setUsuarioRoles] = useState([]);
  const [recursoRoles, setRecursoRoles] = useState([]);
  const [tab, setTab] = useState('roles');
  const [loading, setLoading] = useState(true);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r, res, ur, rr] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/core/roles/`, { headers }).then(r => r.json()),
          fetch(`${BASE_URL}/api/v1/core/recursos/`, { headers }).then(r => r.json()),
          fetch(`${BASE_URL}/api/v1/core/usuario-roles/`, { headers }).then(r => r.json()),
          fetch(`${BASE_URL}/api/v1/core/recurso-roles/`, { headers }).then(r => r.json()),
        ]);
        const filteredRoles = (Array.isArray(r) ? r : []).filter(rol => 
          ['Administrador', 'Operador'].includes(rol.nombre)
        );
        setRoles(filteredRoles);
        setRecursos(Array.isArray(res) ? res : []);
        setUsuarioRoles(Array.isArray(ur) ? ur : []);
        setRecursoRoles(Array.isArray(rr) ? rr : []);
      } catch { }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const TABS = [
    { id: 'roles', label: 'Roles', icon: 'fa-shield-alt', count: roles.length },
    { id: 'recursos', label: 'Recursos', icon: 'fa-sitemap', count: recursos.length },
    { id: 'usuario-roles', label: 'Usuario ↔ Rol', icon: 'fa-user-tag', count: usuarioRoles.length },
    { id: 'recurso-roles', label: 'Recurso ↔ Rol', icon: 'fa-key', count: recursoRoles.length },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          Control de Acceso Basado en Roles
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Gestión de roles, recursos y permisos del sistema (RBAC).
        </p>
      </div>

      {/* Matrix visual */}
      <div className="glass-panel" style={{ marginBottom: 20 }}>
        <div className="panel-inner">
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 16 }}>
            MATRIZ DE PERMISOS (RECURSOS × ROLES)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-dim)', fontSize: 10, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    RECURSO
                  </th>
                  {roles.map(rol => (
                    <th key={rol.id} style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                      <RolBadge nombre={rol.nombre} estado={rol.estado} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recursos.map((rec, i) => (
                  <tr key={rec.id} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className={`fas ${rec.icono}`} style={{ color: 'var(--primary)', fontSize: 12, width: 14, textAlign: 'center' }} />
                        <span style={{ fontWeight: 600 }}>{rec.nombre}</span>
                        <span style={{ fontSize: 9, color: '#475569' }}>{rec.url_frontend}</span>
                      </div>
                    </td>
                    {roles.map(rol => {
                      const tiene = recursoRoles.some(rr => rr.recurso === rec.id && rr.rol === rol.id);
                      return (
                        <td key={rol.id} style={{ textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {tiene
                            ? <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: 16 }} />
                            : <i className="fas fa-times-circle" style={{ color: 'rgba(100,116,139,0.3)', fontSize: 16 }} />
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none',
              background: tab === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
              color: tab === t.id ? '#0f1520' : 'var(--text-dim)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s',
            }}
          >
            <i className={`fas ${t.icon}`} />
            {t.label}
            <span style={{
              background: tab === t.id ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.08)',
              padding: '1px 7px', borderRadius: 10, fontSize: 10
            }}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 24, marginBottom: 12, display: 'block' }} />
          Cargando datos RBAC...
        </div>
      ) : (
        <div className="glass-panel">
          <div className="panel-inner">
            {/* ROLES */}
            {tab === 'roles' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {roles.map(rol => (
                  <div key={rol.id} style={{
                    background: 'rgba(0,0,0,0.2)', borderRadius: 14, padding: '18px 20px',
                    border: `1px solid ${rol.estado ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)'}`,
                    opacity: rol.estado ? 1 : 0.6,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rol.nombre}</div>
                      <RolBadge nombre={rol.nombre} estado={rol.estado} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-dim)' }}>
                      <div><i className="fas fa-users" style={{ marginRight: 5, color: 'var(--primary)' }} />{rol.usuarios_count} usuarios</div>
                      <div><i className="fas fa-key" style={{ marginRight: 5, color: '#818cf8' }} />{rol.recursos_count} recursos</div>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 9, color: rol.estado ? '#10b981' : '#ef4444', letterSpacing: 1 }}>
                      <i className={`fas ${rol.estado ? 'fa-check' : 'fa-ban'}`} style={{ marginRight: 5 }} />
                      {rol.estado ? 'ACTIVO' : 'INACTIVO'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RECURSOS */}
            {tab === 'recursos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recursos.map(rec => (
                  <div key={rec.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: '12px 16px',
                    border: '1px solid rgba(255,255,255,0.04)', opacity: rec.estado ? 1 : 0.5,
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fas ${rec.icono}`} style={{ color: 'var(--primary)', fontSize: 14 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{rec.nombre}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                        {rec.url_frontend && <span><i className="fas fa-link" style={{ marginRight: 4 }} />{rec.url_frontend}</span>}
                        {rec.url_backend && <span style={{ marginLeft: 12 }}><i className="fas fa-server" style={{ marginRight: 4 }} />{rec.url_backend}</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: '#475569' }}>Orden: {rec.orden}</div>
                    <span style={{ fontSize: 9, padding: '3px 8px', borderRadius: 20, background: rec.estado ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: rec.estado ? '#10b981' : '#ef4444' }}>
                      {rec.estado ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* USUARIO ↔ ROL */}
            {tab === 'usuario-roles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {usuarioRoles.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-dim)', fontSize: 13 }}>
                    <i className="fas fa-user-tag" style={{ fontSize: 28, marginBottom: 10, display: 'block', opacity: 0.3 }} />
                    No hay asignaciones de roles. Asigna roles a usuarios desde el panel de administración.
                  </div>
                ) : usuarioRoles.map(ur => (
                  <div key={ur.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: '10px 14px' }}>
                    <i className="fas fa-user" style={{ color: '#6366f1', fontSize: 14, width: 16 }} />
                    <span style={{ fontWeight: 700, flex: 1 }}>{ur.usuario_username}</span>
                    <i className="fas fa-arrow-right" style={{ color: 'var(--text-dim)', fontSize: 11 }} />
                    <RolBadge nombre={ur.rol_nombre} estado={true} />
                  </div>
                ))}
              </div>
            )}

            {/* RECURSO ↔ ROL */}
            {tab === 'recurso-roles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recursoRoles.map(rr => (
                  <div key={rr.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: '10px 14px' }}>
                    <i className="fas fa-sitemap" style={{ color: 'var(--primary)', fontSize: 14, width: 16 }} />
                    <span style={{ fontWeight: 700, flex: 1 }}>{rr.recurso_nombre}</span>
                    <i className="fas fa-arrow-right" style={{ color: 'var(--text-dim)', fontSize: 11 }} />
                    <RolBadge nombre={rr.rol_nombre} estado={true} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
