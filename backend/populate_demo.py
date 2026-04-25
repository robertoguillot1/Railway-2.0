import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from modules.farms.models import Farm, Zone, CropType
from modules.devices.models import Device, Sensor, Actuator

def populate_demo():
    print("--- GENERANDO 5 REGISTROS DE PRUEBA ---")

    # 1. Asegurar granja principal
    farm, _ = Farm.objects.get_or_create(name="Hidroponia Central", location="Sector Norte")

    # 2. Datos de los 5 módulos
    demo_zones = [
        {"name": "Modulo A1", "crop": "Maiz (Forraje)", "days_ago": 8, "stage": Zone.Stage.GROWTH},
        {"name": "Modulo B2", "crop": "Avena (Forraje)", "days_ago": 3, "stage": Zone.Stage.GERMINATION},
        {"name": "Modulo C3", "crop": "Lechuga Hidroponica", "days_ago": 15, "stage": Zone.Stage.GROWTH},
        {"name": "Modulo D4", "crop": "Albahaca", "days_ago": 20, "stage": Zone.Stage.FLOWERING},
        {"name": "Modulo E5", "crop": "Cebada (Forraje)", "days_ago": 1, "stage": Zone.Stage.GERMINATION},
    ]

    for data in demo_zones:
        crop = CropType.objects.filter(name__icontains=data["crop"].split(" (")[0]).first()
        if not crop: 
            print(f"Error: No se encontro el cultivo {data['crop']}")
            continue

        start_date = date.today() - timedelta(days=data["days_ago"])
        
        zone, created = Zone.objects.get_or_create(
            name=data["name"],
            defaults={
                "farm": farm,
                "crop_type": crop,
                "code": data["name"].replace(" ", "-").lower(),
                "start_date": start_date,
                "current_stage": data["stage"]
            }
        )

        if created:
            print(f"Creado: {zone.name} ({crop.name}) - Iniciado hace {data['days_ago']} dias.")
            
            # Crear un dispositivo y sensores para cada modulo
            device = Device.objects.create(
                zone=zone, 
                device_id=f"ESP32-{zone.code}", 
                name=f"Controlador {zone.name}"
            )
            Sensor.objects.create(device=device, name="Humedad Sustrato", sensor_type=Sensor.SensorType.HUMIDITY, unit="%")
            Actuator.objects.create(device=device, name="Bomba Riego", actuator_type=Actuator.ActuatorType.PUMP)
        else:
            print(f"Info: El modulo {zone.name} ya existe.")

    print("\n5 Modulos hidroponicos creados y listos para probar.")

if __name__ == "__main__":
    populate_demo()
