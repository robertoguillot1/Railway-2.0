from rest_framework import viewsets
from .models import Zone, CropType
from .serializers import ZoneSerializer, CropTypeSerializer

class CropTypeViewSet(viewsets.ModelViewSet):
    queryset = CropType.objects.all()
    serializer_class = CropTypeSerializer

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
