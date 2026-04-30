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

## Cambio 3: Correcciones de Interfaz y Conexión de API

### Fecha: 2026-04-29

### Resumen
Se realizaron correcciones menores pero críticas en la interfaz del usuario para mejorar la visualización y se solucionó un problema de seguridad que impedía establecer la conexión manual al backend desde el panel de control.

---

### Detalles de las Correcciones:

#### 1. Conexión Backend (`frontend/src/components/panels/ControlPanel.jsx`)
**Problema:** Al intentar conectar el "Modo Railway", el botón fallaba y mostraba el error "No se pudo conectar con la base de datos en Railway".
**Causa:** El botón realizaba un ping usando `fetch` directo sin inyectar el Token JWT, siendo rechazado por las nuevas políticas de seguridad implementadas en DRF (`IsAuthenticated`). Además, la ruta legacy de contingencia apuntaba al endpoint obsoleto (`/api/telemetria/historial`).
**Solución:** 
- Se configuró la inyección de `Authorization: Bearer <token>` extrayendo el JWT de `localStorage`.
- Se actualizó la ruta de fallback a `/api/telemetria/`.

#### 2. Scroll de Terminal (`frontend/src/components/panels/TerminalPanel.jsx`)
**Problema:** El log del sistema crecía infinitamente estirando el layout del dashboard en pantallas grandes.
**Solución:** Se eliminó la regla inline `height: '100%'` del contenedor de la terminal. Esto permitió que el componente respetara el límite de altura (`180px`) dictado por `index.css`, habilitando la barra de desplazamiento (`overflow-y: auto`) y el correcto funcionamiento del auto-scroll hacia abajo (`scrollIntoView`).

#### 3. Cierre de Onboarding Abreviado (`frontend/src/pages/OnboardingPage.jsx`)
**Problema:** Al crear una nueva granja desde el Sidebar (modo rápido), el proceso de creación se completaba en BD pero la interfaz se quedaba estancada en la vista modal, ya que intentaba avanzar al "Paso 2" (inexistente en este modo).
**Solución:** Se agregó lógica condicional en la función `handleCreateFarm` para forzar la llamada a `onComplete()` y cerrar la vista en lugar de intentar llamar a `handleNext()` cuando la bandera `isAbbreviated` es verdadera.

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

## Cambio 3: Corrección de Bugs Reportados

### Fecha: 2026-04-29

### Problemas Reportados por Usuario:

1. **No se puede eliminar módulos/zonas** - Error al intentar eliminar
2. **No se puede cancelar el Onboarding** - Sin opción para salir sin crear

---

### Corrección 1: Eliminación de Zonas

**Problema:** La eliminación de zonas fallaba debido a restricciones de clave foránea.

**Cambios en Backend:**

**`backend/modules/devices/models.py`**
- Cambiado `Device.zone` de `on_delete=models.SET_NULL` a `on_delete=models.CASCADE`
- Esto permite que al eliminar una zona, también se eliminen los dispositivos asociados

**Migración creada:**
- `modules/devices/migrations/0003_alter_device_zone.py`
- Aplicada exitosamente con `python manage.py migrate`

---

### Corrección 2: Botón Cancelar en Onboarding

**Problema:** No había forma de cancelar el proceso de Onboarding.

**Cambios en Frontend:**

**`frontend/src/pages/OnboardingPage.jsx`**
- Agregado botón "Cancelar" visible siempre
- Ubicación: debajo del botón principal de crear
- Acción: llama a `onComplete()` sin crear nada
- Estilo: transparente con borde sutil, texto en gris

---

### Corrección 3: Mejor manejo de errores en ZonesPage

**`frontend/src/pages/ZonesPage.jsx`**
- Mejorado `handleDelete` para mostrar el mensaje de error específico en consola
- Ahora muestra alert con el mensaje de error detallado

---

### Notas de Corrección

- Las correcciones fueron probadas y aplicadas
- La eliminación de zonas ahora funciona correctamente (elimina en cascada)
- El Onboarding ahora tiene botón Cancelar siempre visible
- Usuario de prueba creado: `prueba` / `prueba123`

---

---

## Cambio 4: Mejoras de Gestión, Automatización y UX

### Fecha: 2026-04-30

### Resumen
Se realizó una actualización masiva del dashboard para transformar los componentes estáticos (mocks) en funcionalidades reales, mejorar la persistencia de datos y elevar la estética de la gestión de recursos.

---

### Detalles de las Mejoras:

#### 1. Identidad y Navegación (`AppContext.jsx` & `Header.jsx`)
- **Selector de Fincas**: Implementado dropdown en el Header para cambiar de contexto global.
- **Persistencia**: `selectedFarm` se guarda en `localStorage` y se recupera al iniciar.
- **Filtrado Reactivo**: Al cambiar de finca, el sistema dispara automáticamente la recarga de zonas y dispositivos filtrados.

#### 2. Gestión de Usuarios y RBAC (`UsersPage.jsx` & `RbacPage.jsx`)
- **Edición de Usuarios**: Implementado `EditUserModal` para modificar perfiles existentes (Nombre, Rol, Estado).
- **Simplificación de Roles**: Filtrada la vista de RBAC para mostrar únicamente los roles solicitados: **Administrador** y **Operador**.

#### 3. Ajustes y Automatización (`SettingsPage.jsx`)
- **Reglas de Riego**: Conectadas a la API real. Ahora es posible ver, activar/desactivar y crear nuevas reglas de automatización.
- **Preferencias del Sistema**: Implementada persistencia para unidades de medida (°C/°F, mS/cm/PPM) y preferencias de notificaciones.
- **Perfil de Usuario**: Vinculado a la sesión real (useAuth), mostrando estadísticas de dispositivos y fincas del usuario actual.

#### 4. Alertas Inteligentes (`AlertsPage.jsx`)
- **Eliminación de Mocks**: El sistema ahora consume únicamente alertas reales de la base de datos.
- **Filtros Avanzados**: Añadida capacidad de filtrar por severidad (Crítica, Advertencia, Info) y por estado de revisión.

#### 5. Gestión de Módulos (Zonas) (`ZonesPage.jsx`)
- **Modal Premium**: Sustituido el `prompt` básico por un modal estético para la creación de zonas.
- **Metadata de Cultivo**: Integrada selección de `CropType` (Tipo de Cultivo) y fecha de inicio para calcular automáticamente el progreso del ciclo.

---

### Próximos Pasos Recomendados (Actualizado)

1. **Dashboard IoT**: Finalizar la creación/edición detallada de dispositivos (ESP32) con sus respectivos sensores y actuadores.
2. **Edición de Perfil**: Completar el modal para que el usuario pueda cambiar su propia contraseña y email desde Ajustes.
3. **Optimización de Polling**: Ajustar el intervalo de actualización según la carga del sistema.
4. **Analítica**: Conectar los gráficos de historial con los datos reales filtrados por zona.

---

---

## Cambio 5: Aislamiento de Datos, Gestión Real y Mejoras UX

### Fecha: 2026-04-30

### Resumen
Se resolvieron problemas críticos de integridad de datos entre fincas, se habilitó el CRUD completo para instalaciones y se mejoró la transparencia del sistema RBAC y la automatización.

---

### Detalles de las Mejoras:

#### 1. Aislamiento Total de Datos (`AppContext.jsx`)
- **Fix de Fuga de Datos**: Se implementó el reseteo automático de la telemetría a **0** al cambiar de finca.
- **Conexión Dinámica**: El estado `isConnected` y el `selectedDeviceId` ahora se limpian al cambiar de contexto, evitando que una finca nueva muestre datos de un ESP32 de otra finca (ej. Wokwi).
- **Polling Estricto**: La lógica de obtención de datos ahora ignora lecturas globales si no hay un dispositivo específico seleccionado para la finca actual.

#### 2. Gestión de Instalaciones (Fincas) (`SettingsPage.jsx`)
- **Pestaña de Fincas**: Se creó una interfaz de administración premium para visualizar todas las instalaciones.
- **CRUD de Eliminación**: Implementada la capacidad de eliminar fincas redundantes o repetidas con manejo de errores descriptivo.
- **Limpieza en Cascada**: El borrado de una finca ahora asegura la eliminación de sus zonas y dispositivos asociados (Backend & Frontend sync).

#### 3. Automatización Robusta (`SettingsPage.jsx` & `hydroApi.js`)
- **Selector de Sensores en Reglas**: Se corrigió el error de creación de reglas añadiendo dropdowns dinámicos para seleccionar el **Módulo (Zona)** y el **Sensor de Humedad** específico.
- **Integración API**: Conectada la función `createIrrigationRule` con validación de IDs numéricos para asegurar la persistencia en la base de datos.

#### 4. Transparencia en Seguridad y Usuarios (`RbacPage.jsx` & `UsersPage.jsx`)
- **Visibilidad de Miembros**: Las tarjetas de roles ahora muestran la **lista real de nombres de usuario** asignados (Administradores/Operadores), resolviendo la duda sobre quién pertenece a cada rol.
- **Edición de Perfil Propio**: Habilitado el modal de "Editar Perfil" en Ajustes, permitiendo al usuario cambiar su Nombre, Apellido y Email mediante el nuevo endpoint `updateProfile`.
- **UI de Usuarios**: Rediseño de la cabecera de gestión de usuarios con contadores activos/inactivos y estética mejorada.

#### 5. Navegación y Consistencia UX
- **Tabs Premium**: Refactorización de la navegación interna en Configuración con iconos dinámicos, estados activos claros y micro-animaciones.
- **Alertas de Sistema**: Sincronización de los mensajes de error de la API con alertas visuales para el usuario en caso de fallos de red o permisos.

---

### Próximos Pasos Prioritarios
1. **Validación de Hardware**: Probar la recepción de datos reales del ESP32 una vez seleccionada la finca y dispositivo correctos en el nuevo flujo aislado.
2. **Dashboard de Actuadores**: Mejorar la retroalimentación visual cuando un actuador es activado por una regla de automatización.
3. **Logs de Auditoría**: Implementar la visualización de quién realizó qué cambios en la página de RBAC.

---

*Documento actualizado - Proyecto HydroSmart Pro*