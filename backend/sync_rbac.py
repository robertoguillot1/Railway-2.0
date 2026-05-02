
import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from modules.core.rbac_models import Rol, UsuarioHasRol

def sync_all_users():
    print("Sincronizando usuarios con tabla RBAC...")
    admin_rol, _ = Rol.objects.get_or_create(nombre="Administrador")
    operador_rol, _ = Rol.objects.get_or_create(nombre="Operador")
    
    users = User.objects.all()
    count = 0
    for user in users:
        is_admin = user.is_staff or user.is_superuser
        target_rol = admin_rol if is_admin else operador_rol
        
        # Eliminar roles previos para limpiar
        UsuarioHasRol.objects.filter(usuario=user).delete()
        # Crear la nueva relación
        UsuarioHasRol.objects.create(usuario=user, rol=target_rol)
        count += 1
        print(f" - Usuario: {user.username} -> {target_rol.nombre}")
    
    print(f"¡Sincronización completada! {count} usuarios procesados.")

if __name__ == "__main__":
    sync_all_users()
