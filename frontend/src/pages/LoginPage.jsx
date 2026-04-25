// src/pages/LoginPage.jsx
// Pantalla de login premium con validación y feedback visual

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Completa todos los campos.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, #0d2818 0%, #080d14 50%, #0a1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Outfit, sans-serif',
      padding: 20,
    }}>
      {/* Background decorative circles */}
      <div style={{
        position: 'fixed', top: '-200px', right: '-200px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-200px', left: '-200px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(13,20,36,0.85)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '44px 40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #10b981, #38bdf8, transparent)',
        }} />

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(16,185,129,0.35)',
          }}>
            <i className="fas fa-seedling" style={{ fontSize: 28, color: 'white' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            HydroSmart <span style={{ color: '#10b981' }}>Pro</span>
          </div>
          <div style={{ fontSize: 11, color: '#475569', letterSpacing: 2, marginTop: 4 }}>
            SISTEMA HIDROPÓNICO INTELIGENTE
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '10px 14px',
            marginBottom: 20, fontSize: 12,
            color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="fas fa-exclamation-circle" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
              USUARIO
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-user" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#475569', fontSize: 13
              }} />
              <input
                id="input-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Tu nombre de usuario"
                autoComplete="username"
                style={{
                  width: '100%', padding: '12px 14px 12px 40px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, color: 'white', fontSize: 13,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
              CONTRASEÑA
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-lock" style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: '#475569', fontSize: 13
              }} />
              <input
                id="input-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '12px 44px 12px 40px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, color: 'white', fontSize: 13,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#10b981'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 13,
                }}
              >
                <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none', borderRadius: 12,
              color: 'white', fontSize: 14, fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: 1,
              boxShadow: loading ? 'none' : '0 8px 24px rgba(16,185,129,0.35)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            {loading ? (
              <><i className="fas fa-circle-notch fa-spin" /> AUTENTICANDO...</>
            ) : (
              <><i className="fas fa-sign-in-alt" /> INICIAR SESIÓN</>
            )}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 10, color: '#334155', letterSpacing: 1 }}>
          <i className="fas fa-shield-alt" style={{ marginRight: 6 }} />
          ACCESO SEGURO · CIFRADO JWT
        </div>
      </div>
    </div>
  );
}
