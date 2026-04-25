import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from modules.farms.models import Farm, Zone, CropType
from modules.devices.models import Device, Sensor, Actuator, ActuatorStateHistory
from modules.automation.models import IrrigationRule, SensorReading, SystemEvent

def run_fire_test():
    print("--- INICIANDO PRUEBA DE FUEGO - BACKEND 2.0 ---")

    # 1. Preparar datos base
    crop, _ = CropType.objects.get_or_create(name="Maiz (Test)", duration_days=10)
    farm, _ = Farm.objects.get_or_create(name="Granja Experimental", location="Lab 1")
    zone, _ = Zone.objects.get_or_create(
        name="Modulo A1", 
        code="MOD-A1", 
        farm=farm, 
        crop_type=crop,
        start_date=date.today()
    )

    device, _ = Device.objects.get_or_create(device_id="ESP32-HYDRO-01", name="Controlador Principal", zone=zone)
    
    sensor, _ = Sensor.objects.get_or_create(
        device=device, 
        name="Sensor Humedad Sustrato", 
        sensor_type=Sensor.SensorType.HUMIDITY,
        unit="%"
    )
    
    actuator, _ = Actuator.objects.get_or_create(
        device=device, 
        name="Bomba de Riego 1", 
        actuator_type=Actuator.ActuatorType.PUMP
    )

    # 2. Configurar la Regla de Oro
    rule, _ = IrrigationRule.objects.get_or_create(
        zone=zone,
        sensor=sensor,
        name="Riego Critico Maiz",
        min_threshold=30.0,
        active=True
    )
    print(f"Configuracion lista: Modulo '{zone.name}' con cultivo de '{crop.name}'.")
    print(f"Regla activa: Encender si Humedad < {rule.min_threshold}%")

    # 3. LA PRUEBA: Simular lectura de sensor (25% - Muy Seco)
    print("\nSimulando lectura de ESP32: Humedad detectada = 25%...")
    reading = SensorReading.objects.create(sensor=sensor, value=25.0)

    # 4. Verificación de Resultados
    actuator.refresh_from_db()
    
    print("\n--- RESULTADOS DE LA AUTOMATIZACION ---")
    if actuator.state:
        print(f"ESTADO BOMBA: [ENCENDIDA] - EXITO!")
    else:
        print(f"ESTADO BOMBA: [APAGADA] - FALLO")

    history = ActuatorStateHistory.objects.filter(actuator=actuator).last()
    if history:
        print(f"HISTORIAL: Se creo registro en 'estado_bomba'")

    event = SystemEvent.objects.filter(zone=zone).last()
    if event:
        print(f"EVENTO: Se registro '{event.description}'")

    print("\n--- PRUEBA COMPLETADA EXITOSAMENTE ---")

if __name__ == "__main__":
    run_fire_test()
