// src/pages/OnboardingPage.jsx
// Wizard de 3 pasos para configuración inicial de nuevas instalaciones

import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { createFarm, createZone, createDevice, getCropTypes } from '../api/hydroApi';

export default function OnboardingPage({ onComplete, isAbbreviated = false }) {
  const { setFarms, setSelectedFarm, selectedFarm } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Datos del formulario
  const [farmData, setFarmData] = useState({ name: '', location: '' });
  const [zoneData, setZoneData] = useState({ name: '', crop_type: null });
  const [deviceData, setDeviceData] = useState({ device_id: '', name: '' });
  const [crops, setCrops] = useState([]);
  
  // Cargar tipos de cultivo al inicio
  useEffect(() => {
    getCropTypes().then(setCrops).catch(() => {});
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    if (!farmData.name.trim()) {
      setError('El nombre de la granja es obligatorio');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const farm = await createFarm(farmData);
      setFarms(prev => [...prev, farm]);
      setSelectedFarm(farm);
      if (isAbbreviated) {
        onComplete();
      } else {
        handleNext();
      }
    } catch (err) {
      setError('Error al crear la granja. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    if (!zoneData.name.trim()) {
      setError('El nombre de la zona es obligatorio');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const zone = await createZone({
        name: zoneData.name,
        farm: selectedFarm?.id,
        crop_type: zoneData.crop_type,
        code: `ZONA-${Date.now()}`
      });
      handleNext();
    } catch (err) {
      setError('Error al crear la zona. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDevice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (deviceData.device_id && deviceData.name) {
        await createDevice({
          device_id: deviceData.device_id,
          name: deviceData.name,
        });
      }
      onComplete();
    } catch (err) {
      setError('Error al registrar el dispositivo. Puedes continuar sin él.');
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = isAbbreviated ? 1 : 3;
  const currentStep = isAbbreviated ? 1 : step;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1424 0%, #1a2332 50%, #0d1424 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 500,
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: 40,
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(16,185,129,0.3)',
          }}>
            <i className="fas fa-seedling" style={{ fontSize: 28, color: 'white' }} />
          </div>
          <h1 style={{
            fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 700,
            color: 'white', marginBottom: 8,
          }}>
            {isAbbreviated ? 'Nueva Granja' : 'Bienvenido a HydroSmart'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            {isAbbreviated 
              ? 'Crea una nueva instalación hidropónica' 
              : 'Configuremos tu primera instalación hidropónica'}
          </p>
        </div>

        {/* Progress Bar */}
        {!isAbbreviated && (
          <div style={{
            display: 'flex', gap: 8, marginBottom: 32, justifyContent: 'center',
          }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: 60, height: 4, borderRadius: 2,
                background: i <= step ? 'linear-gradient(90deg, #10b981, #059669)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        )}

        {/* Step Indicator */}
        <div style={{
          textAlign: 'center', marginBottom: 24,
          fontSize: 12, color: '#10b981', fontWeight: 600, letterSpacing: 1,
        }}>
          {!isAbbreviated && `PASO ${step} DE 3`}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#fca5a5',
            fontSize: 13,
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />
            {error}
          </div>
        )}

        {/* Step 1: Create Farm */}
        {(step === 1 || isAbbreviated) && (
          <form onSubmit={handleCreateFarm}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#64748b', letterSpacing: 1, marginBottom: 8,
              }}>
                NOMBRE DE LA INSTALACIÓN *
              </label>
              <input
                type="text"
                value={farmData.name}
                onChange={e => setFarmData(p => ({ ...p, name: e.target.value }))}
                placeholder="Mi Granja Hidropónica"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#64748b', letterSpacing: 1, marginBottom: 8,
              }}>
                UBICACIÓN
              </label>
              <input
                type="text"
                value={farmData.location}
                onChange={e => setFarmData(p => ({ ...p, location: e.target.value }))}
                placeholder="Ciudad, País"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px 24px', borderRadius: 12,
                background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', color: 'white', fontWeight: 700, fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {loading ? (
                <><i className="fas fa-circle-notch fa-spin" /> Creando...</>
              ) : (
                <>{isAbbreviated ? 'Crear Granja' : 'Siguiente'} <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} /></>
              )}
            </button>
            
            {/* Botón Cancelar siempre visible */}
            <button
              type="button"
              onClick={onComplete}
              style={{
                width: '100%', marginTop: 12, padding: '12px 24px', borderRadius: 12,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#64748b', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              }}
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Step 2: Create Zone */}
        {step === 2 && !isAbbreviated && (
          <form onSubmit={handleCreateZone}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#64748b', letterSpacing: 1, marginBottom: 8,
              }}>
                NOMBRE DEL MÓDULO / ZONA *
              </label>
              <input
                type="text"
                value={zoneData.name}
                onChange={e => setZoneData(p => ({ ...p, name: e.target.value }))}
                placeholder="Zona 1 - Lechugas"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#64748b', letterSpacing: 1, marginBottom: 8,
              }}>
                TIPO DE CULTIVO (OPCIONAL)
              </label>
              <select
                value={zoneData.crop_type || ''}
                onChange={e => setZoneData(p => ({ ...p, crop_type: e.target.value || null }))}
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Seleccionar cultivo...</option>
                {crops.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 12,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: 8 }} /> Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 12,
                  background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                {loading ? (
                  <><i className="fas fa-circle-notch fa-spin" /> Creando...</>
                ) : (
                  <>Siguiente <i className="fas fa-arrow-right" style={{ marginLeft: 8 }} /></>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Register Device */}
        {step === 3 && !isAbbreviated && (
          <form onSubmit={handleCreateDevice}>
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#64748b', letterSpacing: 1, marginBottom: 8,
              }}>
                ID DEL DISPOSITIVO (ESP32)
              </label>
              <input
                type="text"
                value={deviceData.device_id}
                onChange={e => setDeviceData(p => ({ ...p, device_id: e.target.value }))}
                placeholder="HYDRO-001"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 8 }}>
                Ingresa el ID que asignaste a tu ESP32. Puedes omitirlo y registrarlo después.
              </p>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 700,
                color: '#64748b', letterSpacing: 1, marginBottom: 8,
              }}>
                NOMBRE DEL DISPOSITIVO
              </label>
              <input
                type="text"
                value={deviceData.name}
                onChange={e => setDeviceData(p => ({ ...p, name: e.target.value }))}
                placeholder="Mi ESP32 Principal"
                style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 14, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 12,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: 8 }} /> Atrás
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1, padding: '14px 24px', borderRadius: 12,
                  background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', color: 'white', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
                }}
              >
                {loading ? (
                  <><i className="fas fa-circle-notch fa-spin" /> Finalizando...</>
                ) : (
                  <>Completar <i className="fas fa-check" style={{ marginLeft: 8 }} /></>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Skip Link */}
        {!isAbbreviated && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button
              type="button"
              onClick={onComplete}
              style={{
                background: 'none', border: 'none', color: '#64748b',
                fontSize: 12, cursor: 'pointer',
              }}
            >
              Omitir registro de dispositivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}