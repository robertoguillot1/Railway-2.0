from django.contrib import admin
from .models import Farm, Zone, CropType

@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'active')
    list_filter = ('active',)
    search_fields = ('name', 'location')

@admin.register(CropType)
class CropTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'scientific_name', 'duration_days')
    search_fields = ('name',)

@admin.register(Zone)
class ZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'crop_type', 'current_day', 'current_stage', 'active')
    list_filter = ('current_stage', 'active', 'crop_type')
    search_fields = ('name', 'code')
    readonly_fields = ('current_day',)
