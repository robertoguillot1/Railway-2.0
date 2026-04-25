// src/pages/UsersPage.jsx
// Panel de gestión de usuarios — solo visible para administradores

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BASE_URL } from '../api/hydroApi';

function UserCard({ user, onDelete, currentUserId }) {
  const isMe = user.id === currentUserId;
  return (
    <div style={{
      background: isMe ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isMe ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.2s',
    }}>
      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: 13, flexShrink: 0,
        background: user.is_admin ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: user.is_admin ? '#f59e0b' : '#6366f1',
        border: `1px solid ${user.is_admin ? 'rgba(245,158,11,0.25)' : 'rgba(99,102,241,0.25)'}`,
      }}>
        <i className={`fas ${user.is_admin ? 'fa-crown' : 'fa-user'}`} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{user.full_name}</span>
          <span className={`badge ${user.is_admin ? '' : 'badge-ok'}`} style={
            user.is_admin ? { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' } : {}
          }>
            {user.is_admin ? '👑 ADMIN' : 'USUARIO'}
          </span>
          {isMe && <span className="badge" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: 9 }}>TÚ</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          <i className="fas fa-at" style={{ marginRight: 5 }} />{user.username}
          {user.email && <span style={{ marginLeft: 12 }}><i className="fas fa-envelope" style={{ marginRight: 5 }} />{user.email}</span>}
        </div>
      </div>

      {/* Date */}
      <div style={{ fontSize: 10, color: '#475569', textAlign: 'right', flexShrink: 0 }}>
        <div><i className="far fa-calendar" style={{ marginRight: 5 }} /></div>
        <div>{new Date(user.date_joined).toLocaleDateString('es-CO')}</div>
      </div>

      {/* Delete */}
      {!isMe && (
        <button
          onClick={() => { if (confirm(`¿Eliminar a ${user.username}?`)) onDelete(user.id); }}
          style={{
            flexShrink: 0, width: 34, height: 34, borderRadius: 10,
            border: 'none', background: 'rgba(239,68,68,0.08)',
            color: '#ef4444', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          title="Eliminar usuario"
        >
          <i className="fas fa-trash" />
        </button>
      )}
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', password: '', is_admin: false });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/core/users/`, { headers });
      if (res.ok) setUsers(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    await fetch(`${BASE_URL}/api/v1/core/users/${id}/`, { method: 'DELETE', headers });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setFormError('Usuario y contraseña son obligatorios.'); return; }
    setCreating(true); setFormError('');
    try {
      const res = await fetch(`${BASE_URL}/api/v1/core/users/`, {
        method: 'POST', headers, body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(Object.values(err).flat().join(' '));
      }
      await fetchUsers();
      setForm({ username: '', email: '', first_name: '', last_name: '', password: '', is_admin: false });
      setShowForm(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
            {users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''} en el sistema.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px', borderRadius: 12, background: 'var(--primary)',
            border: 'none', color: '#0f1520', fontWeight: 800, fontSize: 12,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 15px var(--primary-glow)', fontFamily: 'Outfit, sans-serif',
          }}
        >
          <i className={`fas ${showForm ? 'fa-times' : 'fa-user-plus'}`} />
          {showForm ? 'CANCELAR' : 'NUEVO USUARIO'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="glass-panel" style={{ marginBottom: 20 }}>
          <div className="panel-inner">
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 16 }}>
              <i className="fas fa-user-plus" style={{ marginRight: 8, color: 'var(--primary)' }} />
              Crear Nuevo Usuario
            </div>
            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: '#fca5a5' }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }} />{formError}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                {[
                  { key: 'username', label: 'Usuario *', type: 'text', placeholder: 'nombre_usuario' },
                  { key: 'password', label: 'Contraseña *', type: 'password', placeholder: 'min. 6 caracteres' },
                  { key: 'first_name', label: 'Nombre', type: 'text', placeholder: 'Juan' },
                  { key: 'last_name', label: 'Apellido', type: 'text', placeholder: 'Pérez' },
                  { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'correo@ejemplo.com' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{f.label.toUpperCase()}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '10px 12px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'white', fontSize: 12, outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.is_admin}
                    onChange={e => setForm(p => ({ ...p, is_admin: e.target.checked }))}
                    style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                  />
                  <span><i className="fas fa-crown" style={{ color: '#f59e0b', marginRight: 5 }} />Dar permisos de administrador</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={creating}
                style={{
                  padding: '10px 24px', borderRadius: 10, background: 'var(--primary)',
                  border: 'none', color: '#0f1520', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                {creating ? <><i className="fas fa-circle-notch fa-spin" /> Creando...</> : <><i className="fas fa-check" style={{ marginRight: 6 }} />Crear Usuario</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Users list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>
            <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 24, marginBottom: 12, display: 'block' }} />
            Cargando usuarios...
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>No hay usuarios.</div>
        ) : (
          users.map(u => <UserCard key={u.id} user={u} onDelete={handleDelete} currentUserId={currentUser?.id} />)
        )}
      </div>
    </div>
  );
}
