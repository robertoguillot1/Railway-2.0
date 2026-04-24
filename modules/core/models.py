from django.db import models
from django.utils.translation import gettext_lazy as _

class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Creado el"))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_("Actualizado el"))

    class Meta:
        abstract = True

class AuditLog(TimeStampedModel):
    user = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs_v2",
        verbose_name=_("Usuario")
    )
    action = models.CharField(_("Acción"), max_length=100)
    model_name = models.CharField(_("Modelo"), max_length=100)
    object_id = models.CharField(_("ID del Objeto"), max_length=50)
    changes = models.JSONField(_("Cambios"), default=dict)

    class Meta:
        db_table = "auditoria"
        verbose_name = _("Auditoría")
        verbose_name_plural = _("Auditorías")
