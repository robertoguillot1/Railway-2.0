from .models import SensorReading, SystemEvent, SystemAlert, IrrigationRule
from modules.devices.models import Actuator, ActuatorStateHistory
from modules.core.services import WeatherService

class IrrigationService:
    @staticmethod
    def process_reading(sensor_reading):
        """
        Analiza una lectura y decide si activar o desactivar actuadores
        basándose en las reglas configuradas y el CLIMA.
        """
        rules = IrrigationRule.objects.filter(sensor=sensor_reading.sensor, active=True)
        
        for rule in rules:
            if sensor_reading.value <= rule.min_threshold:
                # ANTES DE REGAR: ¿Va a llover?
                if WeatherService.should_skip_irrigation():
                    SystemAlert.objects.create(
                        zone=rule.zone,
                        title="Riego Pospuesto por Clima",
                        message=f"Humedad baja ({sensor_reading.value}%), pero se detecto lluvia proxima. Ahorrando agua.",
                        severity=SystemAlert.Severity.INFO
                    )
                    continue

                # Activar riego si no va a llover
                IrrigationService.trigger_actuators(rule, sensor_reading, state=True)
            elif rule.max_threshold and sensor_reading.value >= rule.max_threshold:
                # Desactivar riego
                IrrigationService.trigger_actuators(rule, sensor_reading, state=False)

    @staticmethod
    def trigger_actuators(rule, reading, state):
        """
        Enciende o apaga los actuadores vinculados a la zona de la regla.
        """
        actuators = Actuator.objects.filter(device__zone=rule.zone)
        
        for actuator in actuators:
            if actuator.state != state:
                actuator.state = state
                actuator.save()
                
                # Registrar historial de estado (estado_bomba)
                ActuatorStateHistory.objects.create(
                    actuator=actuator,
                    state=state
                )
                
                # Registrar evento del sistema
                SystemEvent.objects.create(
                    zone=rule.zone,
                    actuator=actuator,
                    reading=reading,
                    description=f"{'Encendido' if state else 'Apagado'} automático por regla: {rule.name}"
                )
                
                print(f"[AUTOMATION] Actuador {actuator.name} {'encendido' if state else 'apagado'} por umbral.")
