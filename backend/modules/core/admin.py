from django.contrib import admin
from .models import AuditLog
from .rbac_models import Rol, Recurso, UsuarioHasRol, RecursoHasRol

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'estado']
    list_filter = ['estado']
    search_fields = ['nombre']

@admin.register(Recurso)
class RecursoAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'url_frontend', 'icono', 'orden', 'estado']
    list_filter = ['estado']
    search_fields = ['nombre']
    ordering = ['orden']

@admin.register(UsuarioHasRol)
class UsuarioHasRolAdmin(admin.ModelAdmin):
    list_display = ['usuario', 'rol']
    list_filter = ['rol']
    search_fields = ['usuario__username', 'rol__nombre']

@admin.register(RecursoHasRol)
class RecursoHasRolAdmin(admin.ModelAdmin):
    list_display = ['recurso', 'rol']
    list_filter = ['rol']
    search_fields = ['recurso__nombre', 'rol__nombre']

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'model_name', 'created_at']
    list_filter = ['action', 'model_name']
    readonly_fields = ['created_at', 'updated_at']
