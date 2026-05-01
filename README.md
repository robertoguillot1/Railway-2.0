# Proyecto Hidropónico IoT - Sistema de Gestión Inteligente (HydroSmart Pro)

Este documento detalla la arquitectura, tecnologías y diseño de base de datos del proyecto **HydroSmart Pro**, con el propósito de servir como guía para la sustentación y defensa del proyecto.

---

## 1. Tecnologías y Frameworks Utilizados

### Backend
El backend fue desarrollado con una arquitectura modular y escalable utilizando **Python** y los siguientes frameworks:
- **Framework Principal:** [Django (v5.2)](https://www.djangoproject.com/) - Proveedor de la lógica de negocio, ORM y administración de base de datos.
- **API REST:** [Django REST Framework (DRF)](https://www.django-rest-framework.org/) - Utilizado para construir los endpoints que consume el frontend.
- **Autenticación:** JWT (JSON Web Tokens) a través de `djangorestframework-simplejwt` para la seguridad de los endpoints.
- **Documentación de API:** `drf-spectacular` para autogenerar la documentación OpenAPI (Swagger).
- **Base de Datos:** SQLite para el desarrollo local, preparado para migración a MySQL/PostgreSQL en producción (Railway) utilizando `dj-database-url` y `mysqlclient`.

### Frontend
El frontend fue construido como una Single Page Application (SPA) dinámica e interactiva enfocada en la visualización de datos:
- **Librería Core:** [React (v19)](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/) para un empaquetado y servidor de desarrollo ultrarrápido.
- **Lenguaje:** JavaScript/TypeScript moderno.
- **Visualización de Datos y UI:** 
  - `recharts` para los gráficos estadísticos y de telemetría.
  - `lucide-react` para la iconografía moderna.
  - `three` (Three.js) para visualizaciones o animaciones 3D avanzadas.
- **Consumo de API:** Uso de `fetch` de forma centralizada gestionando el Token JWT almacenado en `localStorage`.

---

## 2. Arquitectura de Base de Datos y Relaciones (Tablas)

El backend sigue un diseño **Modular**, separando el dominio del problema en pequeñas aplicaciones (Farms, Devices, Automation, Core). Las tablas se comunican fuertemente mediante llaves foráneas (`ForeignKey`).

### Módulo `Farms` (Gestión Agrícola)
Este es el corazón lógico para la gestión de las instalaciones físicas.
- **Farm (Granja/Instalación):** Es la entidad principal. Una granja puede tener muchos Módulos Hidropónicos.
- **CropType (Tipo de Cultivo):** Catálogo de cultivos (ej. Lechuga, Tomate) y sus duraciones estimadas de ciclo (días).
- **Zone (Módulo Hidropónico / Zona):** Representa la mesa o tubo de cultivo real. 
  - *Relaciones:* Pertenece a una `Farm` (1 a muchos) y tiene asignado un `CropType` (1 a muchos). Mantiene el seguimiento de la etapa de crecimiento actual.

### Módulo `Devices` (Hardware IoT y Control)
Maneja la representación de los microcontroladores (ej. ESP32) y sus periféricos.
- **Device (Controlador IoT):** El cerebro de hardware. 
  - *Relaciones:* Se vincula a un `Zone` (Módulo). Un módulo hidropónico puede ser controlado por un dispositivo.
- **Sensor:** Mide variables físicas (pH, Conductividad Eléctrica, Temperatura, Nivel de Agua).
  - *Relaciones:* Pertenece a un `Device`.
- **Actuator (Actuador):** Hardware de acción (Bomba de Riego, Oxigenador, Dosificador).
  - *Relaciones:* Pertenece a un `Device`.
- **ActuatorStateHistory (Historial):** Registra cada vez que un actuador se enciende o apaga para la trazabilidad de consumo y actividad. Pertenece a un `Actuator`.

### Módulo `Automation` (Lógica Inteligente y Telemetría)
Gestiona el sistema de control autónomo y almacena los datos generados.
- **IrrigationRule (Regla de Automatización):** Define cuándo debe actuar el sistema.
  - *Relaciones:* Pertenece a una `Zone` y escucha a un `Sensor` específico. Establece umbrales (ej. si el pH baja de 5.5, activar bomba dosificadora durante 5 minutos).
- **SensorReading (Lectura de Sensor):** Es el registro histórico de telemetría (Big Data del proyecto).
  - *Relaciones:* Pertenece a un `Sensor`.
- **SystemEvent / SystemAlert (Eventos y Alertas):** Registra anomalías o acciones automatizadas ejecutadas por el sistema. Vinculado a `Zone` y `Actuator`.

---

## 3. Relación Backend - Frontend (Arquitectura de Comunicación)

La arquitectura es **Cliente - Servidor (Decoupled)**. El Frontend no tiene conexión directa con la Base de Datos; toda la comunicación pasa por la **API RESTful**.

### ¿Cómo están conectados?
1. **Capa de API Centralizada (`hydroApi.js`):** En el frontend, el archivo `src/api/hydroApi.js` actúa como el puente. Contiene todas las definiciones de peticiones hacia el backend.
2. **Endpoints Versionados:** El frontend llama a rutas específicas del backend de Django, como:
   - `/api/v1/farms/farms/` -> Para listar y crear granjas.
   - `/api/v1/devices/sensors/` -> Para obtener la lista de sensores.
   - `/api/v1/automation/readings/` -> Para obtener el histórico de telemetría de los sensores y mostrarlos en gráficos (`recharts`).
3. **Flujo de Autenticación (JWT):**
   - El usuario inicia sesión en el Frontend.
   - El Backend valida credenciales y devuelve un **Token JWT**.
   - El Frontend intercepta todas las peticiones en `hydroApi.js` e inyecta el token en el header HTTP: `Authorization: Bearer <token>`.
4. **Flujo de IoT (Hardware -> Backend -> Frontend):**
   - Los dispositivos físicos (ESP32) envían datos (ej. un nivel de pH de 6.0) al backend mediante HTTP/MQTT.
   - El backend (Django) guarda esto en la tabla `SensorReading`.
   - El frontend consume el endpoint de lecturas y grafica en tiempo real el comportamiento para el usuario usando la librería de visualización en React.
   - Desde el frontend, el usuario puede actualizar una `IrrigationRule` (Regla), que el backend guarda. Posteriormente, el dispositivo IoT sincronizará esta regla para ajustar su comportamiento físico de riego.

---

### Resumen para Sustentación
*“El proyecto presenta una arquitectura en tres capas. En el nivel de campo, contamos con dispositivos IoT (Microcontroladores, sensores, actuadores). En el nivel lógico, utilizamos Python con Django y Django REST Framework para procesar la telemetría, gestionar una base de datos relacional altamente normalizada y proporcionar endpoints seguros mediante JWT. Finalmente, en el nivel de presentación, construimos una Single Page Application con React y Vite, diseñada para consumir la API REST y mostrar visualizaciones en tiempo real del estado de los cultivos y parámetros hídricos, permitiendo al usuario tomar decisiones basadas en datos e intervenir sobre el hardware de forma remota.”*
