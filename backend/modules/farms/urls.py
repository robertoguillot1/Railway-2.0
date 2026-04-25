from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ZoneViewSet, CropTypeViewSet, FarmViewSet

router = DefaultRouter()
router.register(r'farms', FarmViewSet)
router.register(r'zones', ZoneViewSet)
router.register(r'crops', CropTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
