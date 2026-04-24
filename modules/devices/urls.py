from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeviceViewSet, SensorViewSet, ActuatorViewSet, ActuatorStateHistoryViewSet

router = DefaultRouter()
router.register(r'list', DeviceViewSet)
router.register(r'sensors', SensorViewSet)
router.register(r'actuators', ActuatorViewSet)
router.register(r'history', ActuatorStateHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
