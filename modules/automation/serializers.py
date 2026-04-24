from rest_framework import serializers
from .models import SensorReading, SystemEvent, SystemAlert, IrrigationRule

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = '__all__'

class SystemEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemEvent
        fields = '__all__'
