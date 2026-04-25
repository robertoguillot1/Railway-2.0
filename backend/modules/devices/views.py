from rest_framework import viewsets, permissions
from .models import Device, Sensor, Actuator, ActuatorStateHistory
from .serializers import DeviceSerializer, SensorSerializer, ActuatorSerializer, ActuatorStateHistorySerializer

class DeviceViewSet(viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class ActuatorViewSet(viewsets.ModelViewSet):
    queryset = Actuator.objects.all()
    serializer_class = ActuatorSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class ActuatorStateHistoryViewSet(viewsets.ModelViewSet):
    queryset = ActuatorStateHistory.objects.all()
    serializer_class = ActuatorStateHistorySerializer
