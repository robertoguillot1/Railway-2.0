from rest_framework import viewsets
from modules.core.views import AuditMixin
from .models import Device, Sensor, Actuator, ActuatorStateHistory
from .serializers import DeviceSerializer, SensorSerializer, ActuatorSerializer, ActuatorStateHistorySerializer

class DeviceViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer

class SensorViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class ActuatorViewSet(AuditMixin, viewsets.ModelViewSet):
    queryset = Actuator.objects.all()
    serializer_class = ActuatorSerializer

class ActuatorStateHistoryViewSet(viewsets.ModelViewSet):
    queryset = ActuatorStateHistory.objects.all()
    serializer_class = ActuatorStateHistorySerializer
