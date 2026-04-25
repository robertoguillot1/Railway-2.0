// src/components/ui/IAModal.jsx
// Modal del Agro-Asistente IA — Diagnóstico inteligente basado en datos de sensores

import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { STAGES, getPHStatus, getECStatus } from '../../utils/helpers';

function TypeWriter({ text, speed = 12 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) { setDisplayed(prev => prev + text[i]); i++; }
      else clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <span dangerouslySetInnerHTML={{ __html: displayed }} />;
}

function generateDiagnosis(telemetry, cropDay) {
  const { humidity, temperature, ph, ec, waterLevel, pumpState } = telemetry;
  const stage = STAGES[Math.min(cropDay - 1, STAGES.length - 1)];
  const phStatus = getPHStatus(ph);
  const ecStatus = getECStatus(ec);
  const h = Math.round(humidity);
  const issues = [];
  let main = '';

  // Humidity analysis
  if (h < 30)
    main = `<span style="color:#ef4444"><b>🚨 ALERTA CRÍTICA:</b> El sustrato ha caído a <b>${h}%</b>. Riesgo de marchitamiento en etapa de ${stage}. Se recomienda activar riego de inmediato.</span>`;
  else if (h > 85)
    main = `<span style="color:#38bdf8"><b>💧 SATURACIÓN:</b> Humedad del sustrato en <b>${h}%</b>. Monitorear drenaje para prevenir asfixia radicular.</span>`;
  else
    main = `<span style="color:#10b981"><b>🌿 ESTADO ÓPTIMO:</b> Sustrato estable al <b>${h}%</b>. La planta en etapa <b>${stage}</b> está en zona de confort biológico.</span>`;

  // pH warnings
  if (ph < 5.8 || ph > 7.2)
    issues.push(`⚗️ <b>pH ${ph.toFixed(2)}</b>: ${phStatus.label}. Ajustar solución nutritiva para optimizar la absorción.`);

  // EC warnings
  if (ec < 0.8 || ec > 2.8)
    issues.push(`⚡ <b>EC ${ec.toFixed(2)} mS</b>: ${ecStatus.label}. ${ec < 0.8 ? 'Aumentar concentración de nutrientes.' : 'Reducir o diluir la solución.'}`);

  // Temperature
  if (temperature > 30)
    issues.push(`🌡️ <b>Temperatura ${temperature.toFixed(1)}°C</b>: Estrés térmico detectado. Evaluar ventilación y sombreado.`);
  else if (temperature < 15)
    issues.push(`❄️ <b>Temperatura ${temperature.toFixed(1)}°C</b>: Frío excesivo ralentiza el metabolismo. Verificar calefacción.`);

  // Water level
  if (waterLevel < 25)
    issues.push(`🪣 <b>Nivel del tanque ${Math.round(waterLevel)}%</b>: Nivel crítico. Reabastecer solución nutritiva urgente.`);

  return { main, issues };
}

export default function IAModal() {
  const { iaModalOpen, setIaModalOpen, telemetry, cropDay, addLog } = useApp();
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  useEffect(() => {
    if (!iaModalOpen) { setDiagnosis(null); return; }
    setLoading(true);
    addLog('🤖 IA: Iniciando escaneo de telemetría...');
    const timer = setTimeout(() => {
      const result = generateDiagnosis(telemetry, cropDay);
      setDiagnosis(result);
      setLoading(false);
      addLog('🤖 IA: Diagnóstico completado exitosamente.');
    }, 1800);
    return () => clearTimeout(timer);
  }, [iaModalOpen]);

  if (!iaModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIaModalOpen(false)}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(139,92,246,0.4)',
            animation: loading ? 'pulseDot 1s infinite' : 'none',
          }}>
            <i className="fas fa-robot" style={{ fontSize: 22, color: 'white' }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>Agro-Asistente</div>
            <div style={{ fontSize: 10, color: '#a78bfa', letterSpacing: 1 }}>DIAGNÓSTICO INTELIGENTE</div>
          </div>
        </div>

        <hr className="divider" />

        {/* Content */}
        <div style={{ minHeight: 120, textAlign: 'left', fontSize: 13, lineHeight: 1.7, color: 'var(--text-dim)' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
              <div style={{
                width: 30, height: 30, border: '3px solid rgba(139,92,246,0.2)',
                borderTopColor: '#8b5cf6', borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ fontSize: 11, letterSpacing: 2, color: '#8b5cf6', fontWeight: 700 }}>
                ACCEDIENDO A RED SENSORIAL...
              </span>
            </div>
          ) : diagnosis && (
            <>
              <p style={{ marginBottom: 16 }}>
                <TypeWriter text={diagnosis.main} speed={10} />
              </p>
              {diagnosis.issues.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {diagnosis.issues.map((issue, i) => (
                    <div key={i} style={{
                      background: 'rgba(245,158,11,0.06)',
                      border: '1px solid rgba(245,158,11,0.2)',
                      borderLeft: '3px solid #f59e0b',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 12,
                      color: 'var(--text-dim)',
                    }}
                      dangerouslySetInnerHTML={{ __html: issue }}
                    />
                  ))}
                </div>
              )}
              {diagnosis.issues.length === 0 && (
                <div style={{ marginTop: 12, color: '#10b981', fontSize: 12 }}>
                  ✅ Todos los parámetros dentro del rango óptimo. No se requiere intervención.
                </div>
              )}
            </>
          )}
        </div>

        <hr className="divider" />

        <button
          id="btn-close-ia"
          onClick={() => setIaModalOpen(false)}
          style={{
            marginTop: 8,
            padding: '11px 28px',
            borderRadius: 50,
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, fontFamily: 'Outfit',
            boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
            transition: 'all 0.2s',
          }}
        >
          CERRAR ASISTENTE
        </button>
      </div>
    </div>
  );
}
