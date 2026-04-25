from rest_framework import serializers
from django.contrib.auth.models import User
from .rbac_models import Rol, Recurso, UsuarioHasRol, RecursoHasRol


class RolSerializer(serializers.ModelSerializer):
    usuarios_count = serializers.SerializerMethodField()
    recursos_count = serializers.SerializerMethodField()

    class Meta:
        model = Rol
        fields = ['id', 'nombre', 'estado', 'usuarios_count', 'recursos_count']

    def get_usuarios_count(self, obj):
        return obj.usuarios_asignados.count()

    def get_recursos_count(self, obj):
        return obj.permisos.count()


class RecursoSerializer(serializers.ModelSerializer):
    recurso_padre_nombre = serializers.CharField(source='recurso_padre.nombre', read_only=True)

    class Meta:
        model = Recurso
        fields = ['id', 'nombre', 'url_backend', 'url_frontend', 'path',
                  'icono', 'orden', 'recurso_padre', 'recurso_padre_nombre', 'estado']


class UsuarioHasRolSerializer(serializers.ModelSerializer):
    usuario_username = serializers.CharField(source='usuario.username', read_only=True)
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)

    class Meta:
        model = UsuarioHasRol
        fields = ['id', 'usuario', 'usuario_username', 'rol', 'rol_nombre']


class RecursoHasRolSerializer(serializers.ModelSerializer):
    recurso_nombre = serializers.CharField(source='recurso.nombre', read_only=True)
    rol_nombre = serializers.CharField(source='rol.nombre', read_only=True)

    class Meta:
        model = RecursoHasRol
        fields = ['id', 'recurso', 'recurso_nombre', 'rol', 'rol_nombre']


class MisRecursosSerializer(serializers.Serializer):
    """Retorna los recursos a los que el usuario tiene acceso según sus roles."""
    recursos = RecursoSerializer(many=True)
    roles = RolSerializer(many=True)
