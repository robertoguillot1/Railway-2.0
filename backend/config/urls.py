from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from modules.automation.views import LegacyTelemetriaView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Swagger & Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Modules
    path('api/v1/core/', include('modules.core.urls')),
    path('api/v1/farms/', include('modules.farms.urls')),
    path('api/v1/devices/', include('modules.devices.urls')),
    path('api/v1/automation/', include('modules.automation.urls')),
    
    # Legacy compatibility for ESP32 (Wokwi)
    path('api/telemetria/', LegacyTelemetriaView.as_view()),
    path('api/telemetria', LegacyTelemetriaView.as_view()),
]
