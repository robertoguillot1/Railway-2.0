from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .rbac_models import Rol, Recurso, UsuarioHasRol, RecursoHasRol
from .rbac_serializers import (
    RolSerializer, RecursoSerializer,
    UsuarioHasRolSerializer, RecursoHasRolSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


class RolViewSet(viewsets.ModelViewSet):
    """CRUD de Roles del sistema."""
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class RecursoViewSet(viewsets.ModelViewSet):
    """CRUD de Recursos/Páginas del sistema."""
    queryset = Recurso.objects.all().order_by('orden')
    serializer_class = RecursoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class UsuarioHasRolViewSet(viewsets.ModelViewSet):
    """Asignación de roles a usuarios (usuario_has_rol)."""
    queryset = UsuarioHasRol.objects.select_related('usuario', 'rol').all()
    serializer_class = UsuarioHasRolSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class RecursoHasRolViewSet(viewsets.ModelViewSet):
    """Asignación de recursos a roles (Recurso_has_rol)."""
    queryset = RecursoHasRol.objects.select_related('recurso', 'rol').all()
    serializer_class = RecursoHasRolSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def mis_recursos(request):
    """
    Retorna los recursos y roles del usuario autenticado.
    El frontend puede usar esto para mostrar/ocultar menús dinámicamente.
    """
    user = request.user
    roles_ids = UsuarioHasRol.objects.filter(usuario=user).values_list('rol_id', flat=True)
    roles = Rol.objects.filter(id__in=roles_ids, estado=True)
    recursos = Recurso.objects.filter(
        accesos__rol__in=roles,
        estado=True
    ).distinct().order_by('orden')

    return Response({
        'usuario': user.username,
        'es_admin': user.is_staff or user.is_superuser,
        'roles': RolSerializer(roles, many=True).data,
        'recursos': RecursoSerializer(recursos, many=True).data,
    })
