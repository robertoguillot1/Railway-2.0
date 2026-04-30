from rest_framework import viewsets, permissions
from .models import Zone, CropType, Farm
from .serializers import ZoneSerializer, CropTypeSerializer, FarmSerializer

class CropTypeViewSet(viewsets.ModelViewSet):
    queryset = CropType.objects.all()
    serializer_class = CropTypeSerializer

class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer

class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

    def get_queryset(self):
        queryset = Zone.objects.all()
        farm_id = self.request.query_params.get('farm')
        if farm_id:
            queryset = queryset.filter(farm_id=farm_id)
        return queryset
