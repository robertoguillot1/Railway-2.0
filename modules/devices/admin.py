from django.contrib import admin
from .models import Device, Sensor, Actuator, ActuatorStateHistory

class SensorInline(admin.TabularInline):
    model = Sensor
    extra = 1

class ActuatorInline(admin.TabularInline):
    model = Actuator
    extra = 1

@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_id', 'zone', 'active')
    list_filter = ('active', 'zone')
    search_fields = ('name', 'device_id')
    inlines = [SensorInline, ActuatorInline]

@admin.register(ActuatorStateHistory)
class ActuatorStateHistoryAdmin(admin.ModelAdmin):
    list_display = ('actuator', 'state', 'timestamp')
    list_filter = ('state', 'actuator')
    readonly_fields = ('timestamp',)
