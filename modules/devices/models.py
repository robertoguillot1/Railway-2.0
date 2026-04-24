from django.db import models
from django.utils.translation import gettext_lazy as _
from modules.core.models import TimeStampedModel
from modules.farms.models import Zone

class Device(TimeStampedModel):
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name="devices")
    device_id = models.CharField(_("ID del Dispositivo"), max_length=50, unique=True)
    name = models.CharField(_("Nombre"), max_length=100)
    firmware_version = models.CharField(_("Versión de firmware"), max_length=50, blank=True)
    active = models.BooleanField(_("Activo"), default=True)

    class Meta:
        db_table = "Dispositivo"
        verbose_name = _("Controlador IoT")
        verbose_name_plural = _("Controladores IoT")

    def __str__(self):
        return f"{self.name} ({self.device_id})"

class Sensor(TimeStampedModel):
    class SensorType(models.TextChoices):
        PH = "PH", _("Potencial de Hidrógeno (pH)")
        EC = "EC", _("Conductividad Eléctrica (EC)")
        WATER_TEMP = "WATER_TEMP", _("Temperatura del Agua")
        AIR_TEMP = "AIR_TEMP", _("Temperatura Ambiental")
        HUMIDITY = "HUMIDITY", _("Humedad Ambiental")
        WATER_LEVEL = "WATER_LEVEL", _("Nivel de Tanque")

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="sensors")
    name = models.CharField(_("Nombre del Sensor"), max_length=100)
    sensor_type = models.CharField(_("Tipo de sensor"), max_length=30, choices=SensorType.choices)
    unit = models.CharField(_("Unidad"), max_length=20)
    pin = models.CharField(_("Pin de conexión"), max_length=20, blank=True)
    active = models.BooleanField(_("Activo"), default=True)

    class Meta:
        db_table = "sensor"
        verbose_name = _("Sensor")
        verbose_name_plural = _("Sensores")

    def __str__(self):
        return f"{self.name} ({self.get_sensor_type_display()})"

class Actuator(TimeStampedModel):
    class ActuatorType(models.TextChoices):
        PUMP = "PUMP", _("Bomba de Riego")
        OXYGENATOR = "OXYGENATOR", _("Oxigenador")
        DOSER = "DOSER", _("Dosificador de Nutrientes")
        FAN = "FAN", _("Ventilador")

    device = models.ForeignKey(Device, on_delete=models.CASCADE, related_name="actuators")
    name = models.CharField(_("Nombre del Actuador"), max_length=100)
    actuator_type = models.CharField(_("Tipo"), max_length=20, choices=ActuatorType.choices)
    pin = models.CharField(_("Pin"), max_length=20, blank=True)
    state = models.BooleanField(_("Estado Actual (ON/OFF)"), default=False)

    class Meta:
        db_table = "actuador"
        verbose_name = _("Actuador")
        verbose_name_plural = _("Actuadores")

class ActuatorStateHistory(TimeStampedModel):
    actuator = models.ForeignKey(Actuator, on_delete=models.CASCADE, related_name="history")
    state = models.BooleanField(_("Estado"), default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "estado_bomba"
        verbose_name = _("Historial de Actuador")
        verbose_name_plural = _("Historial de Actuadores")
