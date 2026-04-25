// src/hooks/useSimulator.js
// Simula datos de sensores cuando el modo es 'demo'

import { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export function useSimulator() {
  const {
    connectionMode, operationMode,
    irrigationThreshold, stopThreshold,
    telemetry, setTelemetry,
    sensorHistory, setSensorHistory,
    cropDay, setCropDay,
    addLog,
  } = useApp();

  const dayTimeRef = useRef(0);
  const pumpRef = useRef(false);

  useEffect(() => {
    if (connectionMode !== 'demo') return;

    const interval = setInterval(() => {
      setTelemetry(prev => {
        const pump = pumpRef.current;
        let { humidity, temperature, airHumidity, ph, ec, waterLevel } = prev;

        // Simular variaciones físicas
        if (pump) {
          humidity += 0.45;
          waterLevel -= 0.1;
          ph += (Math.random() - 0.52) * 0.02;
        } else {
          humidity -= 0.12;
          ph += (Math.random() - 0.5) * 0.03;
        }

        temperature += (Math.random() - 0.48) * 0.12;
        airHumidity += (Math.random() - 0.5) * 0.3;
        ec += (Math.random() - 0.5) * 0.01;
        waterLevel = Math.max(20, Math.min(100, waterLevel));

        humidity = Math.min(Math.max(humidity, 0), 100);
        temperature = Math.min(Math.max(temperature, 15), 42);
        airHumidity = Math.min(Math.max(airHumidity, 20), 100);
        ph = Math.min(Math.max(ph, 4.5), 8.5);
        ec = Math.min(Math.max(ec, 0.5), 4.0);

        // Auto-riego
        if (operationMode === 'AUTO') {
          if (humidity <= irrigationThreshold && !pumpRef.current) {
            pumpRef.current = true;
            addLog(`🤖 AUTO: Humedad ${Math.round(humidity)}% — Bomba ACTIVADA`);
          } else if (humidity >= stopThreshold && pumpRef.current) {
            pumpRef.current = false;
            addLog(`🤖 AUTO: Humedad ${Math.round(humidity)}% — Bomba DETENIDA`);
          }
        }

        return {
          ...prev,
          humidity, temperature, airHumidity, ph, ec, waterLevel,
          pumpState: pumpRef.current,
          signal: 0,
        };
      });

      // Actualizar historial
      setSensorHistory(prev => ({
        humidity: [...prev.humidity.slice(1), Math.round(telemetry.humidity)],
        temperature: [...prev.temperature.slice(1), parseFloat(telemetry.temperature.toFixed(1))],
        ph: [...prev.ph.slice(1), parseFloat(telemetry.ph.toFixed(2))],
        ec: [...prev.ec.slice(1), parseFloat(telemetry.ec.toFixed(2))],
      }));

      // Avance del día de cultivo
      dayTimeRef.current += 0.15;
      if (dayTimeRef.current >= 100) {
        dayTimeRef.current = 0;
        setCropDay(d => d >= 7 ? 1 : d + 1);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [connectionMode, operationMode, irrigationThreshold, stopThreshold]);

  // Exponer control de la bomba desde fuera
  const setPumpDemo = (state) => {
    pumpRef.current = state;
    setTelemetry(prev => ({ ...prev, pumpState: state }));
    addLog(`👤 MANUAL: Bomba ${state ? 'ACTIVADA' : 'DETENIDA'} manualmente.`);
  };

  return { setPumpDemo };
}
