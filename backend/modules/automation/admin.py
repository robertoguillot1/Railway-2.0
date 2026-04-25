from django.contrib import admin
from .models import IrrigationRule, SensorReading, SystemEvent, SystemAlert

@admin.register(IrrigationRule)
class IrrigationRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'zone', 'sensor', 'min_threshold', 'active')
    list_filter = ('active', 'zone')
    search_fields = ('name',)

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ('sensor', 'value', 'timestamp')
    list_filter = ('sensor', 'timestamp')
    readonly_fields = ('timestamp',)

@admin.register(SystemEvent)
class SystemEventAdmin(admin.ModelAdmin):
    list_display = ('zone', 'actuator', 'description', 'start_time')
    list_filter = ('zone', 'start_time')
    readonly_fields = ('start_time',)

@admin.register(SystemAlert)
class SystemAlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'severity', 'acknowledged', 'created_at')
    list_filter = ('severity', 'acknowledged')
    search_fields = ('title', 'message')
