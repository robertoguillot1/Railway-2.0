// src/context/AppContext.jsx
// Gestión de estado global del dashboard

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  getLatestReadings, getActuators, updateActuator,
  getSystemAlerts, getSystemEvents, getFarms, getZones, getDevices
} from '../api/hydroApi';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ─── Modo de conexión ───────────────────────────────────────────────────────
  const [connectionMode, setConnectionMode] = useState('demo'); // 'demo' | 'cloud'
  const [cloudUrl, setCloudUrl] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const pollingRef = useRef(null);
  const simRef = useRef(null);

  // ─── Datos de telemetría ────────────────────────────────────────────────────
  const [telemetry, setTelemetry] = useState({
    humidity: 87,
    temperature: 24.5,
    airHumidity: 60,
    ph: 6.5,
    ec: 1.8,
    waterLevel: 75,
    pumpState: false,
    signal: 0,
  });

  // ─── Logs del sistema ───────────────────────────────────────────────────────
  const [logs, setLogs] = useState([
    { ts: new Date(), msg: '🟢 SISTEMA: HydroSmart Pro iniciado en modo Demo.' },
  ]);

  // ─── Actuadores ─────────────────────────────────────────────────────────────
  const [actuators, setActuators] = useState([]);

  // ─── Alertas y eventos ──────────────────────────────────────────────────────
  const [alerts, setAlerts] = useState([]);
  const [events, setEvents] = useState([]);

  // ─── Dispositivos ───────────────────────────────────────────────────────────
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // ─── Modos de operación ─────────────────────────────────────────────────────
  const [operationMode, setOperationMode] = useState('AUTO');
  const [irrigationThreshold, setIrrigationThreshold] = useState(30);
  const [stopThreshold, setStopThreshold] = useState(70);

  // ─── Datos de finca/zonas ───────────────────────────────────────────────────
  const [farms, setFarms] = useState([]);
  const [zones, setZones] = useState([]);
  const [activeZone, setActiveZone] = useState(null);

  // ─── Día del cultivo (simulación) ───────────────────────────────────────────
  const [cropDay, setCropDay] = useState(1);

  // ─── Historial de sensores ──────────────────────────────────────────────────
  const [sensorHistory, setSensorHistory] = useState({
    humidity: Array(30).fill(87),
    temperature: Array(30).fill(24.5),
    ph: Array(30).fill(6.5),
    ec: Array(30).fill(1.8),
  });

  // ─── Navegación ─────────────────────────────────────────────────────────────
  const [activePage, setActivePage] = useState('dashboard');
  const [iaModalOpen, setIaModalOpen] = useState(false);

  // ─── Lógica de Simulación (Solo para modo Demo) ─────────────────────────────
  useEffect(() => {
    if (connectionMode === 'demo') {
      simRef.current = setInterval(() => {
        setTelemetry(prev => ({
          ...prev,
          humidity: Math.max(0, Math.min(100, (prev.humidity || 80) + (prev.pumpState ? 2 : -0.5) + (Math.random() - 0.5))),
          temperature: 24 + Math.random() * 2,
          airHumidity: 55 + Math.random() * 10,
          ph: 6.2 + Math.random() * 0.6,
          ec: 1.5 + Math.random() * 0.5,
          waterLevel: Math.max(0, (prev.waterLevel || 70) - (prev.pumpState ? 0.2 : 0)),
        }));
      }, 3000);
    } else {
      if (simRef.current) clearInterval(simRef.current);
      // Reiniciar a 0 si entramos en modo nube pero no hay datos
      setTelemetry({
        humidity: 0, temperature: 0, airHumidity: 0, ph: 0, ec: 0, waterLevel: 0, pumpState: false, signal: 0
      });
      setSensorHistory({
        humidity: Array(30).fill(0), temperature: Array(30).fill(0), ph: Array(30).fill(0), ec: Array(30).fill(0)
      });
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [connectionMode]);

  // ─── Logger ─────────────────────────────────────────────────────────────────
  const addLog = useCallback((msg) => {
    setLogs(prev => [...prev.slice(-99), { ts: new Date(), msg }]);
  }, []);

  // ─── Toggle actuador en nube ─────────────────────────────────────────────────
  const toggleActuator = useCallback(async (actuatorId, newState, name) => {
    if (connectionMode === 'cloud') {
      try {
        await updateActuator(actuatorId, { state: newState });
        addLog(`☁️ NUBE: ${name} → ${newState ? 'ACTIVADO' : 'DESACTIVADO'}`);
      } catch {
        addLog(`❌ ERROR: No se pudo actualizar ${name} en la nube.`);
      }
    } else {
      addLog(`🎮 DEMO: ${name} → ${newState ? 'ACTIVADO' : 'DESACTIVADO'}`);
    }
    setActuators(prev => prev.map(a => a.id === actuatorId ? { ...a, state: newState } : a));
    if (name?.toLowerCase().includes('bomba')) {
      setTelemetry(prev => ({ ...prev, pumpState: newState }));
    }
  }, [connectionMode, addLog]);

  // ─── Polling de datos en nube ────────────────────────────────────────────────
  const startCloudPolling = useCallback(async () => {
    const poll = async () => {
      try {
        const [readings, acts, alts, evts, farms, zones, devs] = await Promise.allSettled([
          getLatestReadings(),
          getActuators(),
          getSystemAlerts(),
          getSystemEvents(),
          getFarms(),
          getZones(),
          getDevices(),
        ]);

        if (readings.status === 'fulfilled' && readings.value?.length) {
          const byType = {};
          readings.value.forEach(r => {
            const type = r.sensor_type?.toLowerCase() || r.sensor?.sensor_type?.toLowerCase();
            byType[type] = parseFloat(r.value);
          });
          setTelemetry(prev => ({
            ...prev,
            temperature: byType.air_temp ?? byType.water_temp ?? prev.temperature,
            airHumidity: byType.humidity ?? prev.airHumidity,
            ph: byType.ph ?? prev.ph,
            ec: byType.ec ?? prev.ec,
            waterLevel: byType.water_level ?? prev.waterLevel,
            signal: 90 + Math.floor(Math.random() * 8),
          }));
          setSensorHistory(prev => ({
            humidity: [...prev.humidity.slice(1), byType.humidity ?? prev.humidity.at(-1)],
            temperature: [...prev.temperature.slice(1), byType.air_temp ?? prev.temperature.at(-1)],
            ph: [...prev.ph.slice(1), byType.ph ?? prev.ph.at(-1)],
            ec: [...prev.ec.slice(1), byType.ec ?? prev.ec.at(-1)],
          }));
        }

        if (acts.status === 'fulfilled') setActuators(acts.value);
        if (alts.status === 'fulfilled') setAlerts(alts.value);
        if (evts.status === 'fulfilled') setEvents(evts.value);
        if (farms.status === 'fulfilled') setFarms(farms.value);
        if (zones.status === 'fulfilled') setZones(zones.value);
        if (devs.status === 'fulfilled') {
          setDevices(devs.value);
          if (!selectedDeviceId && devs.value.length > 0) {
            setSelectedDeviceId(devs.value[0].id);
          }
        }
      } catch {
        addLog('⚠️ ALERTA: Error al obtener datos de la nube.');
      }
    };
    await poll();
    pollingRef.current = setInterval(poll, 5000);
  }, [addLog]);

  const stopCloudPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = null;
  }, []);

  const value = {
    connectionMode, setConnectionMode,
    cloudUrl, setCloudUrl,
    isConnected, setIsConnected,
    telemetry, setTelemetry,
    logs, addLog,
    actuators, setActuators, toggleActuator,
    alerts, setAlerts,
    events, setEvents,
    operationMode, setOperationMode,
    irrigationThreshold, setIrrigationThreshold,
    stopThreshold, setStopThreshold,
    farms, zones, activeZone, setActiveZone,
    cropDay, setCropDay,
    sensorHistory, setSensorHistory,
    devices, selectedDeviceId, setSelectedDeviceId,
    activePage, setActivePage,
    iaModalOpen, setIaModalOpen,
    startCloudPolling, stopCloudPolling,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
