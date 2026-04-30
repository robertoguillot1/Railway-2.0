// src/components/panels/AnalyticsPanel.jsx
// Panel de analítica avanzada con gráficos reales y selectores de tiempo

import { useState, useEffect } from 'react';
import { getSensorReadings } from '../../api/hydroApi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const getLimitForRange = (range) => {
  switch(range) {
    case '24H': return 50;    
    case '7D': return 500;    
    case '30D': return 2000;  
    default: return 50;
  }
};

const SensorChart = ({ title, data, color, unit }) => (
  <div className="glass-panel" style={{ minHeight: 280 }}>
    <div className="panel-inner" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-dim)', marginBottom: 15, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        {title.toUpperCase()}
      </h3>
      
      {data.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.4 }}>
          <i className="fas fa-chart-line" style={{ fontSize: 24, marginBottom: 10 }} />
          <span style={{ fontSize: 10 }}>Sin datos en este periodo</span>
        </div>
      ) : (
        <div style={{ flex: 1, width: '100%', minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`color-${unit}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                unit={unit}
              />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 11 }}
                itemStyle={{ color: color }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                fillOpacity={1} 
                fill={`url(#color-${unit})`} 
                strokeWidth={2}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  </div>
);

export default function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState('24H');
  const [sensorData, setSensorData] = useState({
    air_temp: [],
    water_temp: [],
    humidity: [],
    soil_moisture: [],
    water_level: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const limit = getLimitForRange(timeRange);
        const readings = await getSensorReadings(null, limit);
        
        const process = (type) => readings
          .filter(r => r.sensor_type === type)
          .map(r => ({
            time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(r.value)
          })).reverse();

        setSensorData({
          air_temp: process('AIR_TEMP'),
          water_temp: process('WATER_TEMP'),
          humidity: process('HUMIDITY'),
          soil_moisture: process('SOIL_MOISTURE'),
          water_level: process('WATER_LEVEL')
        });
      } catch (err) {
        console.error('[HYDRO] Error fetching sensor data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  return (
    <div style={{ marginTop: 25 }}>
      {/* Header con Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            📊 Analítica Detallada
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Tendencias históricas de los sensores vinculados.</p>
        </div>
        
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          {['24H', '7D', '30D'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: timeRange === range ? 'var(--primary)' : 'transparent',
                color: timeRange === range ? '#0f172a' : 'var(--text-dim)',
                fontWeight: 800,
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: 'Outfit'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading && sensorData.air_temp.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: 30, marginBottom: 15 }} />
          <p style={{ fontSize: 13, fontWeight: 600 }}>Sincronizando con la nube...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <SensorChart title="Temperatura Aire" data={sensorData.air_temp} color="#ef4444" unit="°C" />
          <SensorChart title="Temperatura Agua" data={sensorData.water_temp} color="#f59e0b" unit="°C" />
          <SensorChart title="Humedad Ambiente" data={sensorData.humidity} color="#6366f1" unit="%" />
          <SensorChart title="Humedad Suelo" data={sensorData.soil_moisture} color="#10b981" unit="%" />
          <SensorChart title="Nivel Tanque" data={sensorData.water_level} color="#38bdf8" unit="%" />
        </div>
      )}
    </div>
  );
}
