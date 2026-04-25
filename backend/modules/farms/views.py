from rest_framework import viewsets, permissions
from .models import Zone, CropType, Farm
from .serializers import ZoneSerializer, CropTypeSerializer, FarmSerializer

class CropTypeViewSet(viewsets.ModelViewSet):
    queryset = CropType.objects.all()
    serializer_class = CropTypeSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
