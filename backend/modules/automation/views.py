from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import openpyxl
import json
from .models import SensorReading, SystemEvent, SystemAlert
from django.utils import timezone
from datetime import timedelta
from .serializers import SensorReadingSerializer, SystemEventSerializer, SystemAlertSerializer, TelemetriaSerializer
from modules.devices.models import Device, Sensor, Actuator

class SensorReadingViewSet(viewsets.ModelViewSet):
    queryset = SensorReading.objects.all()
    serializer_class = SensorReadingSerializer

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        """
        Genera un archivo Excel con todas las lecturas de sensores.
        """
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Lecturas de Sensores"

        # Encabezados
        columns = ['ID', 'Sensor', 'Valor', 'Unidad', 'Fecha']
        ws.append(columns)

        # Datos
        for reading in self.get_queryset():
            ws.append([
                reading.id,
                reading.sensor.name,
                reading.value,
                reading.sensor.unit,
                reading.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            ])

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename=reporte_lecturas.xlsx'
        wb.save(response)
        return response

@method_decorator(csrf_exempt, name='dispatch')
class LegacyTelemetriaView(APIView):
    """
    Endpoint de compatibilidad para el ESP32 (Wokwi).
    Recibe el formato antiguo y lo traduce al nuevo modelo modular.
    """
    authentication_classes = [] 
    permission_classes = [permissions.AllowAny] # Necesario para el POST del ESP32
    serializer_class = TelemetriaSerializer

    def post(self, request):
        try:
            payload = request.data
            print(f"📥 RECIBIENDO DATOS: {request.data}")
            
            # 1. Obtener o crear dispositivo por defecto para Wokwi
            # Usamos device_id="WOKWI-001" y name="ESP32 Wokwi"
            device, _ = Device.objects.get_or_create(
                device_id="WOKWI-001",
                defaults={"name": "ESP32 Wokwi", "active": True}
            )

            # 2. Guardar Lectura de Temperatura
            if 'temperatura' in payload:
                sensor, _ = Sensor.objects.get_or_create(
                    device=device,
                    sensor_type=Sensor.SensorType.AIR_TEMP,
                    defaults={"name": "Temperatura Ambiente", "unit": "°C"}
                )
                SensorReading.objects.create(sensor=sensor, value=payload.get('temperatura'))

            # 3. Guardar Lectura de Humedad Ambiente
            if 'humedad_ambiente' in payload:
                sensor, _ = Sensor.objects.get_or_create(
                    device=device,
                    sensor_type=Sensor.SensorType.HUMIDITY,
                    name="Humedad Ambiente",
                    defaults={"unit": "%"}
                )
                SensorReading.objects.create(sensor=sensor, value=payload.get('humedad_ambiente'))

            # 4. Guardar Lectura de Humedad Suelo (Sustrato)
            if 'humedad_suelo' in payload:
                # Como no tienes tipo SOIL_MOISTURE, usamos HUMIDITY con nombre diferente
                sensor, _ = Sensor.objects.get_or_create(
                    device=device,
                    name="Humedad Sustrato",
                    defaults={"sensor_type": Sensor.SensorType.SOIL_MOISTURE, "unit": "%"}
                )
                SensorReading.objects.create(sensor=sensor, value=payload.get('humedad_suelo'))

            # 5. Actualizar Estado de la Bomba
            if 'bomba' in payload:
                pump, _ = Actuator.objects.get_or_create(
                    device=device,
                    actuator_type=Actuator.ActuatorType.PUMP,
                    defaults={"name": "Bomba de Riego"}
                )
                new_state = payload.get('bomba', False)
                if pump.state != new_state:
                    pump.state = new_state
                    pump.save()

            # --- Lógica de Alerta de Conexión ---
            recent_alert = SystemAlert.objects.filter(
                title__icontains=device.device_id,
                created_at__gte=timezone.now() - timedelta(hours=1)
            ).exists()
            
            if not recent_alert:
                SystemAlert.objects.create(
                    title=f"Dispositivo Conectado: {device.device_id}",
                    message=f"El controlador {device.name} ha restablecido la comunicación con la nube exitosamente.",
                    severity=SystemAlert.Severity.INFO
                )

            print(f"📡 [WOKWI] Datos procesados exitosamente en Railway.")
            return Response({"success": True, "message": "Datos integrados correctamente"})
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"❌ ERROR CRÍTICO EN TELEMETRÍA:\n{error_details}")
            return Response({"error": str(e), "details": error_details}, status=400)

    def get(self, request):
        """
        Devuelve el historial en el formato antiguo para el Dashboard original.
        """
        if not request.user.is_authenticated:
            return Response({"detail": "No autorizado"}, status=401)
        
        readings = SensorReading.objects.all().order_by('-timestamp')[:30]
        # Agrupamos por timestamp para simular los registros antiguos
        # (Esto es una simplificación para que tu Dashboard siga mostrando gráficas)
        history = []
        for r in readings:
            history.append({
                "temperatura": float(r.value) if r.sensor.sensor_type == Sensor.SensorType.AIR_TEMP else 0,
                "humedad_ambiente": float(r.value) if r.sensor.sensor_type == Sensor.SensorType.HUMIDITY else 0,
                "humedad_suelo": float(r.value) if r.sensor.sensor_type == Sensor.SensorType.SOIL_MOISTURE else 0,
                "bomba_estado": Actuator.objects.first().state if Actuator.objects.exists() else False,
                "fecha": r.timestamp
            })
        return Response(history)

class SystemEventViewSet(viewsets.ModelViewSet):
    queryset = SystemEvent.objects.all()
    serializer_class = SystemEventSerializer

class SystemAlertViewSet(viewsets.ModelViewSet):
    queryset = SystemAlert.objects.all()
    serializer_class = SystemAlertSerializer
