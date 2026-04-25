// src/components/panels/TerminalPanel.jsx
// Terminal de logs del sistema en tiempo real

import { useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/helpers';

export default function TerminalPanel() {
  const { logs } = useApp();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (msg) => {
    if (msg.includes('✅') || msg.includes('🟢')) return '#10b981';
    if (msg.includes('❌') || msg.includes('🚨')) return '#ef4444';
    if (msg.includes('⚠️')) return '#f59e0b';
    if (msg.includes('🤖') || msg.includes('🔄')) return '#8b5cf6';
    if (msg.includes('📷') || msg.includes('🌐')) return '#38bdf8';
    return '#94a3b8';
  };

  return (
    <div id="terminal-container" className="glass-panel" style={{ height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
        </div>
        <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, fontFamily: 'Outfit', fontWeight: 700 }}>
          SYSTEM LOG TERMINAL
        </span>
      </div>
      <div className="terminal" style={{ 
        height: 'calc(100% - 48px)', 
        margin: '8px 10px 10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        paddingRight: '5px'
      }}>
        <div style={{ color: 'rgba(255,255,255,0.15)', marginBottom: 8, fontSize: 9, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 6 }}>
          --- HYDROSMART PRO v2.0 — TERMINAL READY ---
        </div>
        {logs.map((log, i) => (
          <div key={i} className="log-line" style={{ color: getColor(log.msg), fontSize: '11px', lineHeight: '1.4' }}>
            <span className="log-ts" style={{ opacity: 0.5, marginRight: '8px' }}>[{formatTime(log.ts)}]</span>
            {log.msg}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
