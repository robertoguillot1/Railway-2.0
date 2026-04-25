from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import me_view, UserManagementViewSet
from .rbac_views import (
    RolViewSet, RecursoViewSet,
    UsuarioHasRolViewSet, RecursoHasRolViewSet,
    mis_recursos
)

router = DefaultRouter()
# Gestión de usuarios
router.register(r'users', UserManagementViewSet, basename='user')
# RBAC — exactamente las 4 tablas del diagrama del profesor
router.register(r'roles', RolViewSet, basename='rol')
router.register(r'recursos', RecursoViewSet, basename='recurso')
router.register(r'usuario-roles', UsuarioHasRolViewSet, basename='usuario-rol')
router.register(r'recurso-roles', RecursoHasRolViewSet, basename='recurso-rol')

urlpatterns = [
    path('me/', me_view, name='user-me'),
    path('mis-recursos/', mis_recursos, name='mis-recursos'),
    path('', include(router.urls)),
]
