// src/api/hydroApi.js
// Capa de API: Centraliza todas las peticiones al backend Django en Railway

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://railway-20-production-7eaa.up.railway.app';

function apiFetch(path, options = {}) {
  const token = localStorage.getItem('hydro_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  return fetch(`${BASE_URL}${path}`, {
    headers: { ...headers, ...options.headers },
    ...options,
  }).then(async res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Si no hay contenido (como en un DELETE 204), no intentamos parsear JSON
    const text = await res.text();
    return text ? JSON.parse(text) : {};
  });
}

// ─── FARMS (CRUD Completo) ─────────────────────────────────────────────────────
export const getFarms = () => apiFetch('/api/v1/farms/farms/').catch(() => []);
export const createFarm = (data) =>
  apiFetch('/api/v1/farms/farms/', { method: 'POST', body: JSON.stringify(data) });
export const updateFarm = (id, data) =>
  apiFetch(`/api/v1/farms/farms/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteFarm = (id) =>
  apiFetch(`/api/v1/farms/farms/${id}/`, { method: 'DELETE' });

// ─── ZONES ────────────────────────────────────────────────────────────────────
export const getZones = (farmId) =>
  apiFetch(farmId ? `/api/v1/farms/zones/?farm=${farmId}` : '/api/v1/farms/zones/');
export const createZone = (data) =>
  apiFetch('/api/v1/farms/zones/', { method: 'POST', body: JSON.stringify(data) });
export const updateZone = (id, data) =>
  apiFetch(`/api/v1/farms/zones/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteZone = (id) =>
  apiFetch(`/api/v1/farms/zones/${id}/`, { method: 'DELETE' });
export const getCropTypes = () => apiFetch('/api/v1/farms/crops/');
export const createCropType = (data) =>
  apiFetch('/api/v1/farms/crops/', { method: 'POST', body: JSON.stringify(data) });
export const updateCropType = (id, data) =>
  apiFetch(`/api/v1/farms/crops/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCropType = (id) =>
  apiFetch(`/api/v1/farms/crops/${id}/`, { method: 'DELETE' });

// ─── CORE (Users, RBAC, Audit) ─────────────────────────────────────────────────
export const getAuditLogs = () => apiFetch('/api/v1/core/audit-logs/').catch(() => []);
export const getMyResources = () => apiFetch('/api/v1/core/mis-recursos/').catch(() => []);
export const updateProfile = (data) =>
  apiFetch('/api/v1/core/me/', { method: 'PATCH', body: JSON.stringify(data) });
export const changePassword = (password) =>
  apiFetch('/api/v1/core/me/', { method: 'POST', body: JSON.stringify({ password }) });

// ─── DEVICES (CRUD Completo) ───────────────────────────────────────────────────
export const getDevices = () => apiFetch('/api/v1/devices/list/');
export const getDevicesByFarm = (farmId) => {
  if (!farmId) return getDevices();
  return apiFetch(`/api/v1/farms/zones/?farm=${farmId}`).then(zones => {
    const zoneIds = zones.map(z => z.id);
    return getDevices().then(devices => 
      devices.filter(d => zoneIds.includes(d.zone))
    );
  });
};
export const createDevice = (data) =>
  apiFetch('/api/v1/devices/list/', { method: 'POST', body: JSON.stringify(data) });
export const updateDevice = (id, data) =>
  apiFetch(`/api/v1/devices/list/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteDevice = (id) =>
  apiFetch(`/api/v1/devices/list/${id}/`, { method: 'DELETE' });
export const getSensors = () => apiFetch('/api/v1/devices/sensors/');
export const getActuators = () => apiFetch('/api/v1/devices/actuators/');
export const updateActuator = (id, data) =>
  apiFetch(`/api/v1/devices/actuators/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const getActuatorHistory = () => apiFetch('/api/v1/devices/history/');

// ─── AUTOMATION ───────────────────────────────────────────────────────────────
export const getSensorReadings = (sensorId, limit = 50) =>
  apiFetch(`/api/v1/automation/readings/?sensor=${sensorId || ''}&limit=${limit}`);
export const getLatestReadings = () =>
  apiFetch('/api/v1/automation/readings/?ordering=-timestamp&limit=50');
export const getSystemEvents = () =>
  apiFetch('/api/v1/automation/events/?ordering=-start_time&limit=30');
export const getSystemAlerts = () =>
  apiFetch('/api/v1/automation/alerts/').catch(() => []);
export const acknowledgeAlert = (id) =>
  apiFetch(`/api/v1/automation/alerts/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ acknowledged: true }),
  });

// ─── IRRIGATION RULES ─────────────────────────────────────────────────────────
export const getIrrigationRules = () => apiFetch('/api/v1/automation/rules/');
export const createIrrigationRule = (data) =>
  apiFetch('/api/v1/automation/rules/', { method: 'POST', body: JSON.stringify(data) });
export const updateIrrigationRule = (id, data) =>
  apiFetch(`/api/v1/automation/rules/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteIrrigationRule = (id) =>
  apiFetch(`/api/v1/automation/rules/${id}/`, { method: 'DELETE' });

// ─── LEGACY (Railway v1 endpoint) ─────────────────────────────────────────────
export const getTelemetriaHistorial = () =>
  apiFetch('/api/telemetria/');

export const testConnection = async (url) => {
  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  return res.ok;
};
