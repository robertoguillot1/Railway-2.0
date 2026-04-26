from rest_framework import viewsets, permissions
from .models import Device, Sensor, Actuator, ActuatorStateHistory
from .serializers import DeviceSerializer, SensorSerializer, ActuatorSerializer, ActuatorStateHistorySerializer

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class ActuatorViewSet(viewsets.ModelViewSet):
    queryset = Actuator.objects.all()
    serializer_class = ActuatorSerializer

class ActuatorStateHistoryViewSet(viewsets.ModelViewSet):
    queryset = ActuatorStateHistory.objects.all()
    serializer_class = ActuatorStateHistorySerializer
