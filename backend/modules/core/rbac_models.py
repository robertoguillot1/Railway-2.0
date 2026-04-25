from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from modules.core.models import TimeStampedModel


class Rol(models.Model):
    """Tabla: rol — Define los roles del sistema (Administrador, Operador, etc.)"""
    nombre = models.CharField(_("Nombre del Rol"), max_length=45)
    estado = models.BooleanField(_("Estado"), default=True)

    class Meta:
        db_table = "rol"
        verbose_name = _("Rol")
        verbose_name_plural = _("Roles")

    def __str__(self):
        return f"{self.nombre} ({'Activo' if self.estado else 'Inactivo'})"


class Recurso(models.Model):
    """Tabla: Recurso — Define los recursos/páginas del sistema y sus permisos."""
    nombre = models.CharField(_("Nombre del Recurso"), max_length=45)
    url_backend = models.CharField(_("URL Backend"), max_length=45, blank=True)
    url_frontend = models.CharField(_("URL Frontend / Ruta"), max_length=45, blank=True)
    path = models.CharField(_("Path"), max_length=45, blank=True)
    icono = models.CharField(_("Ícono (FontAwesome)"), max_length=45, blank=True)
    orden = models.IntegerField(_("Orden en menú"), default=0)
    recurso_padre = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True,
        related_name="subrecursos", verbose_name=_("Recurso Padre")
    )
    estado = models.BooleanField(_("Estado"), default=True)
    roles = models.ManyToManyField(
        Rol,
        through='RecursoHasRol',
        related_name='recursos',
        verbose_name=_("Roles con acceso")
    )

    class Meta:
        db_table = "Recurso"
        verbose_name = _("Recurso del Sistema")
        verbose_name_plural = _("Recursos del Sistema")
        ordering = ['orden']

    def __str__(self):
        return self.nombre


class UsuarioHasRol(models.Model):
    """Tabla: usuario_has_rol — Relación muchos-a-muchos entre Usuario y Rol."""
    usuario = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name="roles_asignados",
        verbose_name=_("Usuario"),
        db_column="usuario_idusuarios"
    )
    rol = models.ForeignKey(
        Rol, on_delete=models.CASCADE,
        related_name="usuarios_asignados",
        verbose_name=_("Rol"),
        db_column="rol_idrol"
    )

    class Meta:
        db_table = "usuario_has_rol"
        unique_together = [('usuario', 'rol')]
        verbose_name = _("Rol de Usuario")
        verbose_name_plural = _("Roles de Usuarios")

    def __str__(self):
        return f"{self.usuario.username} → {self.rol.nombre}"


class RecursoHasRol(models.Model):
    """Tabla: Recurso_has_rol — Relación muchos-a-muchos entre Recurso y Rol."""
    recurso = models.ForeignKey(
        Recurso, on_delete=models.CASCADE,
        related_name="accesos",
        verbose_name=_("Recurso"),
        db_column="Recurso_idRecursos"
    )
    rol = models.ForeignKey(
        Rol, on_delete=models.CASCADE,
        related_name="permisos",
        verbose_name=_("Rol"),
        db_column="rol_idrol"
    )

    class Meta:
        db_table = "Recurso_has_rol"
        unique_together = [('recurso', 'rol')]
        verbose_name = _("Permiso de Recurso")
        verbose_name_plural = _("Permisos de Recursos")

    def __str__(self):
        return f"{self.recurso.nombre} ← {self.rol.nombre}"
