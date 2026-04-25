from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import me_view, UserManagementViewSet

router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='user')

urlpatterns = [
    path('me/', me_view, name='user-me'),
    path('', include(router.urls)),
]
