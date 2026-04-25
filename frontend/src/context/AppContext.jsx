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
    humidity: 0,
    temperature: 0,
    airHumidity: 0,
    ph: 0,
    ec: 0,
    waterLevel: 0,
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
  const [selectedDeviceId, setSelectedDeviceId] = useState(() => {
    const saved = localStorage.getItem('hydro_selected_device');
    return saved ? Number(saved) : null;
  });

  // ── Ref que siempre apunta al deviceId actual (evita el closure bug) ─────────
  const selectedDeviceIdRef = useRef(selectedDeviceId);

  const handleSetSelectedDevice = useCallback((id) => {
    setSelectedDeviceId(id);
    selectedDeviceIdRef.current = id;
    if (id) localStorage.setItem('hydro_selected_device', id.toString());
  }, []);

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
    humidity: Array(30).fill(0),
    temperature: Array(30).fill(0),
    ph: Array(30).fill(0),
    ec: Array(30).fill(0),
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
      // Reiniciar a 0 si entramos en modo nube
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

  // ─── Polling de datos en nube ─────────────────────────────────────────────────
  // SOLUCIÓN DEFINITIVA: Usar ref en lugar de closure para leer el deviceId actual.
  // Esto evita que el polling use un valor "congelado" del selectedDeviceId.
  const startCloudPolling = useCallback(async () => {
    const poll = async () => {
      try {
        // Leer el deviceId ACTUAL desde el ref (no desde closure)
        const currentDeviceId = selectedDeviceIdRef.current;

        const [readings, acts, alts, evts, farmsRes, zonesRes, devs] = await Promise.allSettled([
          getLatestReadings(),
          getActuators(),
          getSystemAlerts(),
          getSystemEvents(),
          getFarms(),
          getZones(),
          getDevices(),
        ]);

        // ─── Procesar lecturas de sensores ───────────────────────────────────
        if (readings.status === 'fulfilled' && readings.value?.length) {
          const byType = {};

          // Filtrar SOLO las lecturas del dispositivo seleccionado
          const allReadings = readings.value;
          const relevantReadings = currentDeviceId
            ? allReadings.filter(r => r.device_id === currentDeviceId)
            : allReadings;

          // Ordenar por timestamp descendente y tomar el más reciente de cada tipo
          const sorted = [...relevantReadings].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
          );

          // Solo el valor más reciente por tipo de sensor
          sorted.forEach(r => {
            const type = r.sensor_type?.toLowerCase();
            if (type && byType[type] === undefined) {
              byType[type] = parseFloat(r.value);
            }
          });

          console.log('[HYDRO] DeviceId:', currentDeviceId, '| Lecturas filtradas:', relevantReadings.length, '| byType:', byType);

          if (Object.keys(byType).length > 0) {
            setTelemetry(prev => ({
              ...prev,
              humidity: byType.soil_moisture ?? prev.humidity,
              temperature: byType.air_temp ?? byType.water_temp ?? prev.temperature,
              airHumidity: byType.humidity ?? prev.airHumidity,
              ph: byType.ph ?? prev.ph,
              ec: byType.ec ?? prev.ec,
              waterLevel: byType.water_level ?? prev.waterLevel,
              signal: 90 + Math.floor(Math.random() * 8),
            }));

            setSensorHistory(prev => ({
              humidity: [...prev.humidity.slice(1), byType.soil_moisture ?? prev.humidity.at(-1) ?? 0],
              temperature: [...prev.temperature.slice(1), byType.air_temp ?? prev.temperature.at(-1) ?? 0],
              ph: [...prev.ph.slice(1), byType.ph ?? prev.ph.at(-1) ?? 0],
              ec: [...prev.ec.slice(1), byType.ec ?? prev.ec.at(-1) ?? 0],
            }));
          }
        }

        // ─── Procesar actuadores ─────────────────────────────────────────────
        if (acts.status === 'fulfilled') {
          const relevantActs = currentDeviceId
            ? acts.value.filter(a => a.device === currentDeviceId)
            : acts.value;
          setActuators(relevantActs);

          // Sincronizar estado real de la bomba
          const pump = relevantActs.find(a =>
            a.actuator_type === 'PUMP' || a.name?.toLowerCase().includes('bomba')
          );
          if (pump !== undefined) {
            setTelemetry(prev => ({ ...prev, pumpState: pump.state }));
          }
        }

        if (alts.status === 'fulfilled') setAlerts(alts.value);
        if (evts.status === 'fulfilled') setEvents(evts.value);
        if (farmsRes.status === 'fulfilled') setFarms(farmsRes.value);
        if (zonesRes.status === 'fulfilled') setZones(zonesRes.value);
        if (devs.status === 'fulfilled') {
          setDevices(devs.value);
          // Auto-seleccionar solo si no hay nada seleccionado aún
          if (selectedDeviceIdRef.current === null && devs.value.length > 0) {
            handleSetSelectedDevice(devs.value[0].id);
          }
        }
      } catch (err) {
        console.error('[HYDRO] Error en polling:', err);
        addLog('⚠️ ALERTA: Error al procesar datos de la nube.');
      }
    };

    // Primera llamada inmediata
    await poll();
    // Polling continuo cada 3 segundos
    pollingRef.current = setInterval(poll, 3000);
  }, [addLog, handleSetSelectedDevice]); // ← ya NO depende de selectedDeviceId

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
    devices, selectedDeviceId, setSelectedDeviceId: handleSetSelectedDevice,
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
