from rest_framework import serializers
from .models import Device, Sensor, Actuator, ActuatorStateHistory

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class ActuatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actuator
        fields = '__all__'

class DeviceSerializer(serializers.ModelSerializer):
    sensors = SensorSerializer(many=True, read_only=True)
    actuators = ActuatorSerializer(many=True, read_only=True)
    
    class Meta:
        model = Device
        fields = '__all__'

class ActuatorStateHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ActuatorStateHistory
        fields = '__all__'
