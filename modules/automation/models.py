from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from modules.core.models import TimeStampedModel
from modules.farms.models import Zone
from modules.devices.models import Sensor, Actuator

class IrrigationRule(TimeStampedModel):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="rules")
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name="rules")
    name = models.CharField(_("Nombre de la Regla"), max_length=120)
    min_threshold = models.DecimalField(_("Umbral mínimo"), max_digits=10, decimal_places=2)
    max_threshold = models.DecimalField(_("Umbral máximo"), max_digits=10, decimal_places=2, null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(_("Duración de acción (minutos)"), default=5)
    active = models.BooleanField(_("Activo"), default=True)

    class Meta:
        db_table = "Configuracion"
        verbose_name = _("Regla de Automatización")
        verbose_name_plural = _("Reglas de Automatización")

class SensorReading(TimeStampedModel):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name="readings")
    value = models.DecimalField(_("Valor medido"), max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "lectura"
        verbose_name = _("Lectura de Sensor")
        verbose_name_plural = _("Lecturas de Sensores")
        ordering = ["-timestamp"]

class SystemEvent(TimeStampedModel):
    zone = models.ForeignKey(Zone, on_delete=models.CASCADE, related_name="events")
    actuator = models.ForeignKey(Actuator, on_delete=models.CASCADE, related_name="events")
    reading = models.ForeignKey(SensorReading, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    description = models.CharField(_("Descripción del evento"), max_length=255)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "evento"
        verbose_name = _("Evento del Sistema")
        verbose_name_plural = _("Eventos del Sistema")

class SystemAlert(TimeStampedModel):
    class Severity(models.TextChoices):
        INFO = "INFO", _("Informativa")
        WARNING = "WARNING", _("Advertencia")
        CRITICAL = "CRITICAL", _("Crítica")

    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(_("Título de Alerta"), max_length=150)
    message = models.TextField(_("Mensaje"))
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.WARNING)
    acknowledged = models.BooleanField(default=False)

    class Meta:
        db_table = "alerta_sistema"
        verbose_name = _("Alerta del Sistema")
        verbose_name_plural = _("Alertas del Sistema")
