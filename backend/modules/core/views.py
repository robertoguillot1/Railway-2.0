from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, CreateUserSerializer, AuditLogSerializer
from .models import AuditLog

class IsAdminUser(permissions.BasePermission):
    """Permiso: solo administradores (is_staff o is_superuser)."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """Retorna los datos del usuario actual o actualiza su contraseña."""
    if request.method == 'POST':
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Contraseña requerida.'}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(password)
        request.user.save()
        return Response({'message': 'Contraseña actualizada.'})
    
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

    @action(detail=True, methods=['post'])
    def set_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        if not password:
            return Response({'error': 'La contraseña es requerida.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'message': 'Contraseña actualizada correctamente.'})

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para ver auditorías. Solo accesible por administradores.
    """
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdminUser]

