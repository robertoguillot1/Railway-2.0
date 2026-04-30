from rest_framework import serializers
from .models import SensorReading, SystemEvent, SystemAlert, IrrigationRule

class TelemetriaSerializer(serializers.Serializer):
    temperatura = serializers.FloatField(required=False)
    humedad_ambiente = serializers.FloatField(required=False)
    humedad_suelo = serializers.FloatField(required=False)
    bomba = serializers.BooleanField(required=False)

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

class SystemAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemAlert
        fields = '__all__'

class IrrigationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = IrrigationRule
        fields = '__all__'

