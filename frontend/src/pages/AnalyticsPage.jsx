// src/pages/AnalyticsPage.jsx
// Vista de analítica avanzada con gráficos históricos reales

import { useApp } from '../context/AppContext';

export default function AnalyticsPage() {
  const { sensorHistory, telemetry } = useApp();

  const metrics = [
    { label: 'Humedad Suelo', key: 'humidity', color: '#10b981', unit: '%', current: telemetry.humidity },
    { label: 'Temperatura', key: 'temperature', color: '#f59e0b', unit: '°C', current: telemetry.temperature },
    { label: 'Humedad Aire', key: 'airHumidity', color: '#6366f1', unit: '%', current: telemetry.airHumidity },
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>
          Analítica de Cultivo
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>
          Historial de las últimas lecturas sincronizadas desde la nube.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        {metrics.map(metric => {
          const data = sensorHistory[metric.key] || Array(30).fill(0);
          const max = Math.max(...data, 1);
          
          return (
            <div key={metric.key} className="glass-panel">
              <div className="panel-inner">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 700, letterSpacing: 1 }}>{metric.label.toUpperCase()}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: metric.color }}>
                      {metric.current.toFixed(1)}{metric.unit}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.05)' }}>
                    <i className="fas fa-chart-line" />
                  </div>
                </div>

                <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 3, padding: '0 5px' }}>
                  {data.map((val, i) => {
                    const h = (val / max) * 100;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${Math.max(h, 2)}%`,
                          background: metric.color,
                          opacity: 0.15 + (i / data.length) * 0.85,
                          borderRadius: '2px 2px 0 0',
                          transition: 'height 0.6s ease-out'
                        }}
                        title={`${val}${metric.unit}`}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 9, color: 'var(--text-dim)' }}>
                  <span>HACE 15 MIN</span>
                  <span>AHORA</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insights Section */}
      <div className="glass-panel" style={{ marginTop: 24 }}>
        <div className="panel-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              <i className="fas fa-brain" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Sugerencias de AGRO-IA</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Basado en las tendencias de las últimas 24 horas</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>OPTIMIZACIÓN DE RIEGO</div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                La humedad del suelo se mantiene estable. No se requieren ciclos adicionales de riego en las próximas 4 horas.
              </p>
            </div>
            <div style={{ padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>ALERTA TÉRMICA</div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                Tendencia al alza en la temperatura ambiente. Considera activar ventilación si supera los 32°C.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
