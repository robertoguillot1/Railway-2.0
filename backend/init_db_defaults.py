import os
import django
from datetime import date

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from modules.farms.models import Farm, Zone, CropType
from modules.devices.models import Device, Sensor, Actuator
from modules.automation.models import IrrigationRule

def init():
    print("--- INITIALIZING DATABASE DEFAULT RULES ---")
    
    # 1. Ensure a default Crop Type exists
    crop, _ = CropType.objects.get_or_create(
        name="Cultivo Hidroponico", 
        defaults={"duration_days": 60}
    )
    
    # 2. Ensure a default Farm exists
    farm, _ = Farm.objects.get_or_create(
        name="Mi Sistema Hidroponico", 
        defaults={"location": "Invernadero"}
    )
    
    # 3. Ensure a default Zone exists
    zone, _ = Zone.objects.get_or_create(
        name="Zona Principal",
        defaults={
            "code": "ZONA-01",
            "farm": farm,
            "crop_type": crop,
            "start_date": date.today()
        }
    )
    
    # 4. Ensure the ESP32 Wokwi device exists and is assigned to the Zone
    device, created = Device.objects.get_or_create(
        device_id="WOKWI-001",
        defaults={
            "name": "ESP32 Wokwi",
            "active": True,
            "zone": zone
        }
    )
    if not created and not device.zone:
        device.zone = zone
        device.save()
        
    # 5. Ensure the Humedad Sustrato sensor exists
    sensor, _ = Sensor.objects.get_or_create(
        device=device,
        name="Humedad Sustrato",
        defaults={
            "sensor_type": Sensor.SensorType.SOIL_MOISTURE,
            "unit": "%"
        }
    )
    
    # 6. Ensure the Bomba actuator exists
    actuator, _ = Actuator.objects.get_or_create(
        device=device,
        actuator_type=Actuator.ActuatorType.PUMP,
        defaults={
            "name": "Bomba de Riego",
            "state": False
        }
    )
    
    # 7. Ensure the default Irrigation Rule exists
    rule, created = IrrigationRule.objects.get_or_create(
        sensor=sensor,
        defaults={
            "zone": zone,
            "name": "Control Humedad Wokwi",
            "min_threshold": 30.0,
            "max_threshold": 80.0,
            "duration_minutes": 5,
            "active": True
        }
    )
    if not created:
        # Update thresholds to ensure they are 30 and 80
        rule.min_threshold = 30.0
        rule.max_threshold = 80.0
        rule.save()
        
    print("--- DATABASE DEFAULT RULES RUN SUCCESSFULLY ---")

if __name__ == "__main__":
    init()
