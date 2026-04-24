from django.db import models
from django.utils.translation import gettext_lazy as _
from modules.core.models import TimeStampedModel
from datetime import timedelta

class Farm(TimeStampedModel):
    name = models.CharField(_("Nombre de la Instalación"), max_length=120)
    location = models.CharField(_("Ubicación"), max_length=150)
    active = models.BooleanField(_("Activo"), default=True)

    class Meta:
        db_table = "granja"
        verbose_name = _("Instalación Hidropónica")
        verbose_name_plural = _("Instalaciones Hidropónicas")

    def __str__(self):
        return self.name

class CropType(TimeStampedModel):
    name = models.CharField(_("Nombre del Cultivo"), max_length=100)
    scientific_name = models.CharField(_("Nombre Científico"), max_length=100, blank=True)
    duration_days = models.PositiveIntegerField(_("Duración del Ciclo (Días)"), default=15)
    description = models.TextField(_("Descripción"), blank=True)

    class Meta:
        db_table = "tipo_cultivo"
        verbose_name = _("Tipo de Cultivo")
        verbose_name_plural = _("Tipos de Cultivos")

    def __str__(self):
        return f"{self.name} ({self.duration_days} días)"

class Zone(TimeStampedModel):
    class Stage(models.TextChoices):
        GERMINATION = "GERMINATION", _("Germinación / Plántula")
        GROWTH = "GROWTH", _("Crecimiento Vegetativo")
        FLOWERING = "FLOWERING", _("Floración / Fruto")
        HARVEST = "HARVEST", _("Listo para Cosecha")

    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name="zones", verbose_name=_("Instalación"))
    crop_type = models.ForeignKey(CropType, on_delete=models.PROTECT, related_name="zones", verbose_name=_("Tipo de Cultivo"), null=True)
    name = models.CharField(_("Nombre del Módulo"), max_length=100)
    code = models.SlugField(_("Código de Módulo"), max_length=50, unique=True)
    
    # Hidroponía: Seguimiento de ciclo
    start_date = models.DateField(_("Fecha de inicio de ciclo"), null=True, blank=True)
    current_stage = models.CharField(
        _("Etapa actual"), 
        max_length=20, 
        choices=Stage.choices, 
        default=Stage.GERMINATION
    )
    
    active = models.BooleanField(_("Activo"), default=True)

    @property
    def estimated_harvest_date(self):
        if self.start_date and self.crop_type:
            return self.start_date + timedelta(days=self.crop_type.duration_days)
        return None

    @property
    def current_day(self):
        from django.utils import timezone
        if self.start_date:
            delta = timezone.now().date() - self.start_date
            return delta.days + 1
        return 0

    class Meta:
        db_table = "zona"
        verbose_name = _("Módulo Hidropónico")
        verbose_name_plural = _("Módulos Hidropónicos")

    def __str__(self):
        crop_name = self.crop_type.name if self.crop_type else "Sin cultivo"
        return f"{self.name} - {crop_name} (Día {self.current_day})"
