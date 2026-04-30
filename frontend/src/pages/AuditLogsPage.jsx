// src/pages/AuditLogsPage.jsx
// Panel de trazabilidad administrativa — Historial de acciones del sistema

import { useState, useEffect } from 'react';
import { getAuditLogs } from '../api/hydroApi';

const ACTION_COLORS = {
  'CREATE': { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'CREACIÓN' },
  'UPDATE': { bg: 'rgba(56,189,248,0.1)', color: '#38bdf8', label: 'EDICIÓN' },
  'DELETE': { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'ELIMINACIÓN' },
  'LOGIN':  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'ACCESO' },
  'SYSTEM': { bg: 'rgba(99,102,241,0.1)', color: '#818cf8', label: 'SISTEMA' },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogs();
        // Ordenar por fecha descendente si no viene así
        const sorted = (Array.isArray(data) ? data : []).sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setLogs(sorted);
      } catch (err) {
        console.error('[HYDRO] Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.usuario_username?.toLowerCase().includes(filter.toLowerCase()) ||
    log.accion?.toLowerCase().includes(filter.toLowerCase()) ||
    log.descripcion?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
            Trazabilidad del Sistema
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            Historial detallado de todas las acciones administrativas realizadas en la plataforma.
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: 13 }} />
          <input 
            type="text" 
            placeholder="Buscar por usuario o acción..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px 15px 12px 40px', 
              borderRadius: 12, 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              color: 'white', 
              fontSize: 13,
              outline: 'none'
            }} 
          />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div className="panel-inner" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>
              <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 32, marginBottom: 15 }} />
              <p>Cargando registros de auditoría...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-dim)' }}>
              <i className="fas fa-history" style={{ fontSize: 40, marginBottom: 20, opacity: 0.2 }} />
              <p>No se encontraron registros que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-dim)', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>FECHA Y HORA</th>
                    <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-dim)', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>USUARIO</th>
                    <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-dim)', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>ACCIÓN</th>
                    <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-dim)', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>DESCRIPCIÓN</th>
                    <th style={{ textAlign: 'left', padding: '15px 20px', color: 'var(--text-dim)', fontWeight: 800, fontSize: 10, letterSpacing: 1 }}>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => {
                    // Intentar adivinar el tipo de acción para el color
                    let type = 'SYSTEM';
                    if (log.accion.includes('CREATE') || log.accion.includes('POST')) type = 'CREATE';
                    if (log.accion.includes('UPDATE') || log.accion.includes('PATCH') || log.accion.includes('PUT')) type = 'UPDATE';
                    if (log.accion.includes('DELETE')) type = 'DELETE';
                    if (log.accion.includes('LOGIN')) type = 'LOGIN';
                    
                    const style = ACTION_COLORS[type];

                    return (
                      <tr key={log.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }} className="table-row-hover">
                        <td style={{ padding: '15px 20px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{new Date(log.timestamp).toLocaleTimeString()}</div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#818cf8' }}>
                              <i className="fas fa-user" />
                            </div>
                            <span style={{ fontWeight: 700 }}>{log.usuario_username || 'Sistema'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={{ 
                            background: style.bg, 
                            color: style.color, 
                            padding: '4px 10px', 
                            borderRadius: 8, 
                            fontSize: 9, 
                            fontWeight: 800,
                            letterSpacing: 0.5
                          }}>
                            {style.label}
                          </span>
                        </td>
                        <td style={{ padding: '15px 20px', color: 'var(--text-dim)', fontSize: 12, lineHeight: 1.4 }}>
                          {log.descripcion}
                        </td>
                        <td style={{ padding: '15px 20px', fontFamily: 'monospace', color: '#64748b', fontSize: 11 }}>
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .table-row-hover:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
}
