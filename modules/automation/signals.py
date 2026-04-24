from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SensorReading
from .services import IrrigationService

@receiver(post_save, sender=SensorReading)
def handle_new_reading(sender, instance, created, **kwargs):
    """
    Cuando se guarda una nueva lectura, la procesamos automáticamente.
    """
    if created:
        IrrigationService.process_reading(instance)
