from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, CreateUserSerializer, AuditLogSerializer
from .models import AuditLog

class IsAdminUser(permissions.BasePermission):
    """Permiso: solo administradores (is_staff o is_superuser)."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Retorna los datos del usuario actual."""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para administrar usuarios.
    SOLO accesible por administradores.
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        return UserSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'No puedes eliminarte a ti mismo.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({'message': f'Usuario {user.username} eliminado correctamente.'}, status=status.HTTP_200_OK)

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver auditorías. Solo accesible por administradores.
    """
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]

