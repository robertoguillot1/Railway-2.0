from rest_framework import serializers
from .models import Farm, Zone, CropType

class CropTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CropType
        fields = '__all__'

class ZoneSerializer(serializers.ModelSerializer):
    crop_type_name = serializers.CharField(source='crop_type.name', read_only=True)
    estimated_harvest_date = serializers.ReadOnlyField()
    current_day = serializers.ReadOnlyField()

    class Meta:
        model = Zone
        fields = '__all__'
