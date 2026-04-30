from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SensorReadingViewSet, SystemEventViewSet, SystemAlertViewSet, LegacyTelemetriaView, IrrigationRuleViewSet

router = DefaultRouter()
router.register(r'readings', SensorReadingViewSet)
router.register(r'events', SystemEventViewSet)
router.register(r'alerts', SystemAlertViewSet)
router.register(r'rules', IrrigationRuleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('telemetria/', LegacyTelemetriaView.as_view(), name='legacy_telemetria'),
    path('telemetria', LegacyTelemetriaView.as_view()), # Soporte sin barra
]
