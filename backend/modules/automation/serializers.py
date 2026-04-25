from rest_framework import serializers
from .models import SensorReading, SystemEvent, SystemAlert, IrrigationRule

class SensorReadingSerializer(serializers.ModelSerializer):
    sensor_type = serializers.CharField(source='sensor.sensor_type', read_only=True)
    device_id = serializers.IntegerField(source='sensor.device.id', read_only=True)
    
    class Meta:
        model = SensorReading
        fields = ['id', 'sensor', 'sensor_type', 'device_id', 'value', 'timestamp']

class SystemEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemEvent
        fields = '__all__'
