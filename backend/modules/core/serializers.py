from django.contrib.auth.models import User
from rest_framework import serializers
from .models import AuditLog
from .rbac_models import Rol, UsuarioHasRol
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['is_admin'] = user.is_staff or user.is_superuser
        token['full_name'] = f"{user.first_name} {user.last_name}".strip() or user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'full_name': f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username,
            'is_admin': self.user.is_staff or self.user.is_superuser,
        }
        return data

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    # Mapeamos is_admin a is_staff para que sea editable desde el frontend
    is_admin = serializers.BooleanField(source='is_staff', required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_admin', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

    def update(self, instance, validated_data):
        is_staff = validated_data.get('is_staff', instance.is_staff)
        user = super().update(instance, validated_data)
        self._sync_rbac_role(user, is_staff)
        return user

    def _sync_rbac_role(self, user, is_admin):
        """Sincroniza el rol en la tabla custom RBAC (usuario_has_rol)."""
        try:
            # Aseguramos que los roles existan
            admin_rol, _ = Rol.objects.get_or_create(nombre="Administrador")
            operador_rol, _ = Rol.objects.get_or_create(nombre="Operador")

            # Eliminamos asignaciones previas para evitar duplicados o conflictos
            UsuarioHasRol.objects.filter(usuario=user).delete()

            # Asignamos el nuevo rol
            new_rol = admin_rol if is_admin else operador_rol
            UsuarioHasRol.objects.create(usuario=user, rol=new_rol)
        except Exception as e:
            print(f"[RBAC Sync Error] {e}")

class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    is_admin = serializers.BooleanField(default=False, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'is_admin']

    def create(self, validated_data):
        is_admin = validated_data.pop('is_admin', False)
        user = User.objects.create_user(**validated_data)
        if is_admin:
            user.is_staff = True
            user.save()
        
        # Sincronizar con RBAC
        try:
            admin_rol, _ = Rol.objects.get_or_create(nombre="Administrador")
            operador_rol, _ = Rol.objects.get_or_create(nombre="Operador")
            new_rol = admin_rol if is_admin else operador_rol
            UsuarioHasRol.objects.get_or_create(usuario=user, rol=new_rol)
        except:
            pass
            
        return user

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AuditLog
        fields = '__all__'

