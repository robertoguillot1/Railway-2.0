// src/utils/helpers.js

export const STAGES = [
  'SEMILLA', 'BROTE', 'CRECIMIENTO', 'ESTABLE', 'PRE-FLOR', 'FLORACIÓN', 'MADUREZ'
];

export const STAGE_COLORS = {
  GERMINATION: '#8b5cf6',
  GROWTH: '#10b981',
  FLOWERING: '#f59e0b',
  HARVEST: '#ef4444',
};

export const STAGE_DISPLAY = {
  GERMINATION: { label: 'Germinación', icon: 'fa-seedling', color: '#8b5cf6' },
  GROWTH: { label: 'Crecimiento', icon: 'fa-leaf', color: '#10b981' },
  FLOWERING: { label: 'Floración', icon: 'fa-sun', color: '#f59e0b' },
  HARVEST: { label: 'Cosecha', icon: 'fa-carrot', color: '#ef4444' }
};

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('es-ES', { hour12: false });
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getPHStatus(ph) {
  if (ph < 5.5) return { label: 'MUY ÁCIDO', color: '#ef4444', badge: 'badge-danger' };
  if (ph < 6.0) return { label: 'ÁCIDO', color: '#f59e0b', badge: 'badge-warn' };
  if (ph <= 7.0) return { label: 'ÓPTIMO', color: '#10b981', badge: 'badge-ok' };
  if (ph <= 7.5) return { label: 'ALCALINO', color: '#f59e0b', badge: 'badge-warn' };
  return { label: 'MUY ALCALINO', color: '#ef4444', badge: 'badge-danger' };
}

export function getECStatus(ec) {
  if (ec < 0.8) return { label: 'BAJO', color: '#38bdf8', badge: 'badge-purple' };
  if (ec <= 2.5) return { label: 'ÓPTIMO', color: '#10b981', badge: 'badge-ok' };
  return { label: 'ALTO', color: '#ef4444', badge: 'badge-danger' };
}

export function getHumidityStatus(hum) {
  if (hum < 30) return { label: 'SECO', color: '#ef4444' };
  if (hum < 60) return { label: 'NORMAL', color: '#f59e0b' };
  return { label: 'HÚMEDO', color: '#10b981' };
}

export function getTempStatus(temp) {
  if (temp < 15) return { label: 'FRÍO', color: '#38bdf8' };
  if (temp > 30) return { label: 'CALIENTE', color: '#ef4444' };
  return { label: 'ÓPTIMA', color: '#10b981' };
}

export function ringOffset(value, max = 100, r = 58) {
  const circ = 2 * Math.PI * r;
  return circ - (circ * Math.min(value, max)) / max;
}
