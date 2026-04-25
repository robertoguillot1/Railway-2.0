// src/api/hydroApi.js
// Capa de API: Centraliza todas las peticiones al backend Django en Railway

const BASE_URL = import.meta.env.VITE_API_URL || 'https://railway-20-production-7eaa.up.railway.app';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── FARMS ────────────────────────────────────────────────────────────────────
export const getZones = (farmId) =>
  apiFetch(farmId ? `/api/v1/farms/zones/?farm=${farmId}` : '/api/v1/farms/zones/');
export const getCropTypes = () => apiFetch('/api/v1/farms/crops/');

// ─── DEVICES ──────────────────────────────────────────────────────────────────
export const getDevices = () => apiFetch('/api/v1/devices/list/');
export const getSensors = () => apiFetch('/api/v1/devices/sensors/');
export const getActuators = () => apiFetch('/api/v1/devices/actuators/');
export const updateActuator = (id, data) =>
  apiFetch(`/api/v1/devices/actuators/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const getActuatorHistory = () => apiFetch('/api/v1/devices/history/');

// ─── AUTOMATION ───────────────────────────────────────────────────────────────
export const getSensorReadings = (sensorId, limit = 50) =>
  apiFetch(`/api/v1/automation/readings/?sensor=${sensorId || ''}&limit=${limit}`);
export const getLatestReadings = () =>
  apiFetch('/api/v1/automation/readings/?ordering=-timestamp&limit=20');
export const getSystemEvents = () =>
  apiFetch('/api/v1/automation/events/?ordering=-start_time&limit=30');
export const acknowledgeAlert = (id) =>
  apiFetch(`/api/v1/automation/alerts/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ acknowledged: true }),
  });

// ─── LEGACY (Railway v1 endpoint) ─────────────────────────────────────────────
export const getTelemetriaHistorial = () =>
  apiFetch('/api/telemetria/historial');

export const testConnection = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return res.ok;
};
