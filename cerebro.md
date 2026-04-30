# Cerebro - Registro de Cambios

## Fecha: 2026-04-29

---

## Resumen del Análisis

Se analizó la integración entre el frontend (React + Vite) y el backend (Django + DRF). El frontend usaba aproximadamente el 85% de los endpoints disponibles del backend.

---

## Cambios Realizados

### 1. Actualización de `frontend/src/api/hydroApi.js`

#### Endpoints agregados:

**Irrigation Rules (Automation):**
- `getIrrigationRules()` - Obtiene todas las reglas de irrigación
- `createIrrigationRule(data)` - Crea nueva regla
- `updateIrrigationRule(id, data)` - Actualiza regla existente
- `deleteIrrigationRule(id)` - Elimina regla

**Core (Users & RBAC):**
- `getAuditLogs()` - Obtiene logs de auditoría del sistema
- `getMyResources()` - Obtiene los recursos/permisos del usuario actual

**Corrección de bug:**
- `getTelemetriaHistorial()` - Corregido endpoint de `/api/telemetria/historial` a `/api/telemetria/`

---

## Endpoints del Backend

### EndpointsUSED por el Frontend (85%):

| Módulo | Endpoint | Uso |
|--------|----------|-----|
| Auth | `/api/token/` | Login |
| Auth | `/api/v1/core/me/` | Usuario actual |
| Core | `/api/v1/core/users/` | Gestión de usuarios |
| Core | `/api/v1/core/roles/` | RBAC |
| Core | `/api/v1/core/recursos/` | RBAC |
| Core | `/api/v1/core/usuario-roles/` | RBAC |
| Core | `/api/v1/core/recurso-roles/` | RBAC |
| Farms | `/api/v1/farms/farms/` | Granjas |
| Farms | `/api/v1/farms/zones/` | Zonas |
| Farms | `/api/v1/farms/crops/` | Cultivos |
| Devices | `/api/v1/devices/list/` | Dispositivos |
| Devices | `/api/v1/devices/sensors/` | Sensores |
| Devices | `/api/v1/devices/actuators/` | Actuadores |
| Devices | `/api/v1/devices/history/` | Historial |
| Automation | `/api/v1/automation/readings/` | Lecturas |
| Automation | `/api/v1/automation/events/` | Eventos |
| Automation | `/api/v1/automation/alerts/` | Alertas |
| Automation | `/api/v1/automation/rules/` | Reglas de irrigación (AGREGADO) |

### Endpoints NO usados previamente (ahora disponibles):

- `/api/v1/core/audit-logs/` - Logs de auditoría (AGREGADO)
- `/api/v1/core/mis-recursos/` - Permisos del usuario (AGREGADO)

---

## Arquitectura del Proyecto

```
backend_2.0/
├── backend/                    # Django REST API
│   ├── config/                 # Configuración Django
│   ├── modules/
│   │   ├── automation/         # Sensores, alertas, eventos, reglas
│   │   ├── core/              # Usuarios, RBAC, auth
│   │   ├── devices/           # Dispositivos, sensores, actuadores
│   │   └── farms/             # Granjas, zonas, cultivos
│   ├── db.sqlite3             # Base de datos
│   └── requirements.txt        # Dependencias Python
│
└── frontend/                   # React + Vite + TypeScript
    └── src/
        ├── api/hydroApi.js    # Capa de API (actualizado)
        ├── components/         # Componentes UI
        ├── context/            # Estado global (Auth, App)
        ├── pages/              # Páginas principales
        └── hooks/              # Custom hooks
```

---

## Tecnologías Usadas

### Backend:
- Django 5.2.13
- Django REST Framework
- JWT (SimpleJWT)
- SQLite (desarrollo) / MySQL (producción)
- drf-spectacular (documentación)

### Frontend:
- React 19
- Vite
- TypeScript
- Recharts (gráficos)
- Three.js (visualización 3D)
- Axios
- Lucide React (iconos)

---

## Notas

- El frontend tiene un modo "demo" que simula datos sin conexión al backend
- El modo "cloud" usa polling cada 3 segundos para obtener datos en tiempo real
- Sistema RBAC completo implementado con 4 tablas: roles, recursos, usuario-roles, recurso-roles
- Compatible con dispositivos ESP32 para envío de telemetría

---

## Cambio 2: Implementación de Onboarding + CRUD de Granjas

### Fecha: 2026-04-29

### Resumen
Se implementó el flujo de Onboarding para usuarios nuevos y el CRUD completo de Granjas (Farms), Zonas y Dispositivos.

---

### Archivos Modificados/Creados:

#### 1. `frontend/src/api/hydroApi.js`
**Cambios:**
- Modificada función `apiFetch` para incluir JWT automáticamente en todas las peticiones
- Agregado JWT token de localStorage en header `Authorization: Bearer <token>`

**Nuevas funciones CRUD:**
- `createFarm(data)` - POST `/api/v1/farms/farms/`
- `updateFarm(id, data)` - PATCH `/api/v1/farms/farms/{id}/`
- `deleteFarm(id)` - DELETE `/api/v1/farms/farms/{id}/`
- `getDevicesByFarm(farmId)` - Filtra dispositivos por granja
- `createDevice(data)` - POST `/api/v1/devices/list/`
- `updateDevice(id, data)` - PATCH `/api/v1/devices/list/{id}/`
- `deleteDevice(id)` - DELETE `/api/v1/devices/list/{id}/`

---

#### 2. `frontend/src/context/AppContext.jsx`
**Nuevos estados:**
- `selectedFarm` / `setSelectedFarm` - Granja seleccionada actualmente
- `isInitialDataLoaded` - Control de carga inicial
- `showOnboarding` - Control de mostrar onboarding
- `onboardingType` - 'full' o 'abbreviated'

**Nuevas funciones:**
- `loadInitialData()` - Carga granjas y zonas al iniciar sesión
- Exportados todos los nuevos estados en el Provider value

---

#### 3. `frontend/src/App.jsx`
**Cambios en la lógica de ruteo:**
- Importación de OnboardingPage
- Efecto para cargar datos iniciales al hacer login
- Lógica condicional: si `farms.length === 0` muestra Onboarding
- Si `showOnboarding === true` renderiza OnboardingPage en lugar del layout

**Flujo implementado:**
```
LOGIN
   ↓
loadInitialData()
   ↓
farms.length === 0?
   ├─ SÍ → ONBOARDING completo (3 pasos)
   │        1. Granja → 2. Zona → 3. Dispositivo
   │
   └─ NO → Dashboard normal
          └─ [+ Nueva Granja] → Onboarding abreviado (1 paso)
```

---

#### 4. `frontend/src/pages/OnboardingPage.jsx` (NUEVO)
**Wizard de 3 pasos con diseño glassmorphism:**

| Paso | Título | Campos | Acción |
|------|--------|--------|--------|
| 1 | Crear Granja | name, location | `createFarm()` |
| 2 | Crear Zona | name, crop_type (opcional) | `createZone()` |
| 3 | Registrar Dispositivo | device_id, name | `createDevice()` (opcional) |

**Características:**
- Diseño premium con glassmorphism (fondo blurred, bordes sutiles)
- Progress indicator (1/3, 2/3, 3/3)
- Validación de campos obligatorios
- Botones "Atrás" y "Siguiente"
- Soporte para modo abreviado (solo paso Granja)
- Al completar: crea datos, actualiza contexto, redirige a Dashboard

---

#### 5. `frontend/src/components/layout/Sidebar.jsx`
**Agregado:**
- Botón "+ Nueva Granja" con estilo punctured (border dashed)
- Ubicación: después de admin items, antes del botón AI
- Al hacer clic: activa Onboarding en modo abreviado

---

### Flujo de Usuario

#### Usuario Nuevo (sin granjas):
1. Login exitoso
2. `loadInitialData()` detecta `farms.length === 0`
3. Se muestra Onboarding automáticamente (3 pasos)
4. Al completar → Dashboard con la nueva granja creada

#### Usuario Existente (con granjas):
1. Login exitoso
2. Dashboard normal
3. Click en "+ Nueva Granja" en Sidebar
4. Onboarding abreviado (solo crear Granja)
5. Nueva granja aparece en el Sidebar

---

### Estados del Sistema

| Estado | Descripción |
|--------|-------------|
| `isInitialDataLoaded` | false al inicio, true después de `loadInitialData()` |
| `farms.length === 0 && isInitialDataLoaded` | Activa Onboarding obligatorio |
| `showOnboarding === true` | Override para mostrar Onboarding manualmente |
| `onboardingType` | 'full' (3 pasos) o 'abbreviated' (1 paso) |

---

### Funcionalidades del Frontend Ahora Disponibles

| Funcionalidad | Endpoint Backend | Frontend |
|---------------|------------------|----------|
| Crear Granja | POST /api/v1/farms/farms/ | ✅ createFarm() |
| Editar Granja | PATCH /api/v1/farms/farms/{id}/ | ✅ updateFarm() |
| Eliminar Granja | DELETE /api/v1/farms/farms/{id}/ | ✅ deleteFarm() |
| Crear Zona | POST /api/v1/farms/zones/ | ✅ createZone() (ya existía) |
| Registrar Dispositivo | POST /api/v1/devices/list/ | ✅ createDevice() |
| Editar Dispositivo | PATCH /api/v1/devices/list/{id}/ | ✅ updateDevice() |
| Eliminar Dispositivo | DELETE /api/v1/devices/list/{id}/ | ✅ deleteDevice() |

---

### Autenticación

Todas las peticiones POST/PATCH/DELETE ahora incluyen:
```
Authorization: Bearer <token_jwt>
```

El token se obtiene automáticamente de `localStorage.getItem('hydro_token')` en cada petición.

---

### Notas de Implementación

1. El Onboarding solo aparece si el usuario NO tiene granjas en la BD
2. Los usuarios existentes pueden agregar más granjas desde el Sidebar
3. El dispositivo (ESP32) se registra por `device_id`, no por IP
4. La conexión real es: ESP32 → Backend (HTTP/MQTT) → Frontend (polling)
5. El selector de granja en el Header aún no está implementado (pendiente)

---

## Próximos Pasos Recomendados (Actualizado)

1. ✅ ~~Integrar `getAuditLogs()`~~ - Pendiente de uso
2. ✅ ~~Crear página de reglas de irrigación~~ - Pendiente de uso
3. ✅ ~~Implementar `getMyResources()`~~ - Pendiente de uso
4. **Nuevo**: Agregar selector de granjas en el Header para filtrar datos
5. **Nuevo**: Implementar MQTT para comunicación en tiempo real
6. Migrar de SQLite a MySQL para producción
7. Agregar tests de integración

---

*Documento actualizado - Proyecto HydroSmart Pro*