// src/components/panels/AnalyticsPanel.jsx
// Gráfico de líneas interactivo con Recharts — Histórico de sensores

import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';

const SENSORS = [
  { key: 'humidity', label: 'Humedad %', color: '#10b981', unit: '%' },
  { key: 'temperature', label: 'Temperatura °C', color: '#f59e0b', unit: '°C' },
  { key: 'ph', label: 'pH', color: '#8b5cf6', unit: '' },
  { key: 'ec', label: 'EC (mS)', color: '#38bdf8', unit: ' mS' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 11 }}>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, marginBottom: 3 }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPanel() {
  const { sensorHistory } = useApp();
  const [active, setActive] = useState(['humidity', 'temperature']);

  const data = sensorHistory.humidity.map((_, i) => ({
    name: i,
    humidity: sensorHistory.humidity[i],
    temperature: sensorHistory.temperature[i],
    ph: sensorHistory.ph[i],
    ec: sensorHistory.ec[i],
  }));

  const toggleSensor = (key) => {
    setActive(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <div id="analytics-container" className="glass-panel" style={{ height: '100%' }}>
      <div className="panel-top-bar" style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="panel-header" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
          <i className="fas fa-chart-area" />
          Analítica — Histórico
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 6, 
          overflowX: 'auto', 
          maxWidth: '100%',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {SENSORS.map(s => (
            <button
              key={s.key}
              id={`chart-toggle-${s.key}`}
              onClick={() => toggleSensor(s.key)}
              style={{
                border: `1px solid ${active.includes(s.key) ? s.color : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 7,
                padding: '4px 8px',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
                background: active.includes(s.key) ? `${s.color}22` : 'transparent',
                color: active.includes(s.key) ? s.color : 'var(--text-dim)',
                letterSpacing: 0.5,
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px 8px 12px' }}>
        <ResponsiveContainer width="100%" height={175}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            {SENSORS.filter(s => active.includes(s.key)).map(s => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: s.color }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
