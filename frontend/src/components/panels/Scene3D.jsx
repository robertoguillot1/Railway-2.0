// src/components/panels/Scene3D.jsx
// Panel central: Escena 3D Three.js + Vista de cámara en vivo
import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { STAGES } from '../../utils/helpers';
import * as THREE from 'three';

function build3DScene(container, cropDay, pumpOn) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080d14);
  scene.fog = new THREE.Fog(0x080d14, 30, 80);

  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(12, 10, 15);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const sun = new THREE.DirectionalLight(0xfff5cc, 1.2);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  scene.add(sun);
  const blueLight = new THREE.DirectionalLight(0x38bdf8, 0.3);
  blueLight.position.set(-10, 5, -10);
  scene.add(blueLight);

  // Pot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5, 2.8, 5, 64),
    new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.8, roughness: 0.2 })
  );
  pot.position.y = 2.5;
  pot.castShadow = true;
  scene.add(pot);

  // NFT Tray (Hydroponic Channel)
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.4, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x0f2339, metalness: 0.5 })
  );
  tray.position.set(-2, -0.5, 0);
  scene.add(tray);

  // Soil
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(3.3, 3.3, 0.5, 64),
    new THREE.MeshStandardMaterial({ color: 0x1a0f08 })
  );
  soil.position.y = 5.2;
  scene.add(soil);

  // Plant
  const plantGroup = new THREE.Group();
  const scale = 0.2 + (cropDay / 7) * 1.3;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 6, 16),
    new THREE.MeshStandardMaterial({ color: 0x059669 })
  );
  stem.position.y = 3;
  plantGroup.add(stem);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.7 + i * 0.05, 12, 12), leafMat);
    leaf.scale.set(1, 0.15, 0.55);
    leaf.position.y = 1.5 + i * 0.9;
    leaf.rotation.y = (Math.PI / 2.5) * i;
    leaf.rotation.z = 0.55;
    plantGroup.add(leaf);
  }

  // Flower (if day >= 5)
  if (cropDay >= 5) {
    const flowerGroup = new THREE.Group();
    flowerGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.3 })
    ));
    for (let i = 0; i < 6; i++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
      petal.scale.set(1.1, 0.1, 0.7);
      petal.position.set(Math.cos(i * 1.05) * 0.65, 0, Math.sin(i * 1.05) * 0.65);
      flowerGroup.add(petal);
    }
    flowerGroup.position.y = 6.5;
    plantGroup.add(flowerGroup);
  }

  plantGroup.position.set(0, 5, 0);
  plantGroup.scale.setScalar(scale);
  scene.add(plantGroup);

  // ESP32 board
  const esp = new THREE.Group();
  esp.add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x0a2540 })));
  // LED indicator
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1 }));
  led.position.set(0.9, 0.15, 0.6);
  esp.add(led);
  esp.position.set(6, -1.8, 0);
  scene.add(esp);

  // Tube from pump to plant
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6, -1.6, 0),
    new THREE.Vector3(7, 4, 0),
    new THREE.Vector3(0, 8, 0)
  ]);
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(path, 64, 0.1, 12, false),
    new THREE.MeshStandardMaterial({ color: 0x1e3a5f })
  );
  scene.add(tube);

  // Sensor stake
  const sensorGroup = new THREE.Group();
  sensorGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 2, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f1520 })));
  const tips = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
  tips.position.y = -1.1;
  sensorGroup.add(tips);
  sensorGroup.position.set(2, 5.5, 0);
  scene.add(sensorGroup);

  // Water particles
  const waterGeo = new THREE.BufferGeometry();
  const waterPos = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    waterPos[i * 3] = (Math.random() - 0.5) * 1;
    waterPos[i * 3 + 1] = 8;
    waterPos[i * 3 + 2] = (Math.random() - 0.5) * 1;
  }
  waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
  const waterMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.12, transparent: true, opacity: 0.8 });
  const water = new THREE.Points(waterGeo, waterMat);
  water.visible = false;
  scene.add(water);

  // Camera mouse control (simple orbit)
  let isMouseDown = false, lastX = 0, lastY = 0, theta = 0.8, phi = 0.7, radius = 22;

  const onDown = e => { isMouseDown = true; lastX = e.clientX; lastY = e.clientY; };
  const onUp = () => isMouseDown = false;
  const onMove = e => {
    if (!isMouseDown) return;
    theta -= (e.clientX - lastX) * 0.005;
    phi = Math.max(0.2, Math.min(1.5, phi - (e.clientY - lastY) * 0.005));
    lastX = e.clientX; lastY = e.clientY;
  };

  renderer.domElement.addEventListener('mousedown', onDown);
  window.addEventListener('mouseup', onUp);
  window.addEventListener('mousemove', onMove);

  let frameId;
  const animate = () => {
    frameId = requestAnimationFrame(animate);

    // Orbit camera
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
    camera.position.y = 10 + radius * Math.sin(phi);
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    camera.lookAt(0, 5, 0);

    // Water animation
    if (pumpOn.current) {
      water.visible = true;
      const pos = water.geometry.attributes.position.array;
      for (let i = 0; i < 300; i++) {
        pos[i * 3 + 1] -= 0.18;
        if (pos[i * 3 + 1] < 5) pos[i * 3 + 1] = 8;
      }
      water.geometry.attributes.position.needsUpdate = true;
    } else {
      water.visible = false;
    }

    renderer.render(scene, camera);
  };
  animate();

  const onResize = () => {
    if (!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(frameId);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
    if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
  };
}

export default function Scene3D() {
  const { telemetry, cropDay, addLog, camUrl, updateCamUrl } = useApp();
  const [view, setView] = useState('3d');
  const [hasError, setHasError] = useState(false);
  const canvasRef = useRef(null);
  const pumpRef = useRef(telemetry.pumpState);
  const cleanupRef = useRef(null);

  // Reset error when URL changes
  useEffect(() => { setHasError(false); }, [camUrl]);

  // Update pump ref in real time
  useEffect(() => { pumpRef.current = telemetry.pumpState; }, [telemetry.pumpState]);

  // Init 3D scene
  useEffect(() => {
    if (view !== '3d' || !canvasRef.current) return;
    if (cleanupRef.current) cleanupRef.current();
    cleanupRef.current = build3DScene(canvasRef.current, cropDay, pumpRef);
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, [view, cropDay]);

  const stage = STAGES[Math.min(cropDay - 1, STAGES.length - 1)];

  const handleSetView = (v) => {
    setView(v);
    if (v === 'live') {
      addLog(`📷 CÁMARA: Activando vista en vivo...`);
    } else {
      addLog(`🎨 3D: Cambiado a modelo digital.`);
    }
  };

  const handleConnect = () => {
    addLog(`📷 CAM: Conectando a ${camUrl || 'N/A'}`);
    setHasError(false);
  };

  return (
    <div id="scene-container" style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', background: '#080d14', border: '1px solid var(--panel-border)' }}>

      {/* 3D Canvas */}
      <div
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: view === '3d' ? 'block' : 'none' }}
      />

      {/* Live Camera */}
      {view === 'live' && (
        <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {camUrl && !hasError ? (
            <img
              src={camUrl}
              alt="Cámara en vivo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={() => setHasError(true)}
            />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 20 }}>
              <i className="fas fa-video-slash" style={{ fontSize: 48, marginBottom: 16, color: hasError ? 'var(--accent-red)' : 'var(--text-dim)' }} />
              {hasError ? (
                <>
                  <div style={{ fontSize: 14, color: 'var(--text-main)', marginBottom: 8 }}>Error al cargar el video</div>
                  <div style={{ fontSize: 11, maxWidth: 350, margin: '0 auto 16px', lineHeight: 1.4 }}>
                    {camUrl.includes('pinggy') && !camUrl.includes('/stream') && !camUrl.includes('/video') ? (
                      <span style={{ color: 'var(--accent-amber)' }}>
                        <b>Sugerencia:</b> Parece que falta la ruta del stream. Intenta añadir <b>/stream</b> al final de tu link.
                      </span>
                    ) : (
                      "Si usas Pinggy, haz clic abajo para autorizar la conexión en una nueva pestaña y luego regresa aquí."
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <a
                      href={camUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        borderRadius: 8,
                        textDecoration: 'none',
                        fontSize: 11,
                        fontWeight: 700,
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      ABRIR ENLACE Y AUTORIZAR <i className="fas fa-external-link-alt" style={{ marginLeft: 6 }} />
                    </a>
                    {camUrl.includes('pinggy') && !camUrl.includes('/stream') && (
                      <button
                        type="button"
                        onClick={() => updateCamUrl(camUrl + (camUrl.endsWith('/') ? 'stream' : '/stream'))}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--primary)',
                          color: '#0f1520',
                          borderRadius: 8,
                          border: 'none',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        AÑADIR /stream
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13 }}>Ingresa la URL de la cámara abajo</div>
                  <div style={{ fontSize: 10, marginTop: 8, color: '#475569' }}>Ej: https://abc.pinggy-free.link/stream</div>
                </>
              )}
            </div>
          )}
          <div className="live-badge" style={{ background: hasError ? 'rgba(0,0,0,0.5)' : 'rgba(239,68,68,0.3)' }}>
            <i className="fas fa-circle" style={{ color: hasError ? '#64748b' : '#ef4444' }} />
            {hasError ? 'DISCONNECTED' : 'EN VIVO'}
          </div>
        </div>
      )}

      {/* Day Label */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: 50,
        fontSize: 10, fontWeight: 700,
        fontFamily: 'Outfit',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 6,
        letterSpacing: 0.5,
        zIndex: 10,
      }}>
        <span>☀️</span>
        <span style={{ color: 'var(--text-main)' }}>DÍA {cropDay}</span>
        <span className="mobile-hide" style={{ color: 'var(--primary)' }}>/ ETAPA {stage}</span>
      </div>

      {/* View Selector */}
      <div style={{
        position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: 10,
        border: '1px solid rgba(255,255,255,0.06)',
        padding: 4, gap: 4,
        zIndex: 10,
      }}>
        {[
          { id: '3d', icon: 'fa-cube', label: '3D' },
          { id: 'live', icon: 'fa-video', label: 'EN VIVO' },
        ].map(btn => (
          <button
            key={btn.id}
            id={`view-btn-${btn.id}`}
            type="button"
            onClick={() => handleSetView(btn.id)}
            style={{
              border: 'none', cursor: 'pointer',
              padding: '6px 14px', borderRadius: 7,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              background: view === btn.id ? 'var(--primary)' : 'transparent',
              color: view === btn.id ? '#0f1520' : 'white',
              transition: 'all 0.2s',
            }}
          >
            <i className={`fas ${btn.icon}`} style={{ marginRight: 5 }} />
            {btn.label}
          </button>
        ))}
      </div>

      {/* Camera URL input (only in live mode) */}
      {view === 'live' && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          width: '90%', maxWidth: 400,
          display: 'flex', gap: 8,
          zIndex: 10,
        }}>
          <input
            type="text"
            value={camUrl}
            onChange={e => updateCamUrl(e.target.value)}
            placeholder="URL Cámara (Ej: https://.../stream)"
            style={{
              flex: 1,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'white',
              fontSize: 11,
              outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleConnect}
            style={{
              background: 'var(--primary)',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              color: 'white',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <i className="fas fa-plug" />
          </button>
        </div>
      )}

      {/* Bottom Security Badge */}
      <div style={{
        position: 'absolute', bottom: 14, left: 16,
        fontSize: 9, color: 'rgba(100,116,139,0.5)',
        display: 'flex', gap: 12,
      }}>
        <span><i className="fas fa-lock" style={{ marginRight: 4 }} />ENLACE CIFRADO</span>
        <span>CONN: 0x82...f4a</span>
      </div>
    </div>
  );
}
