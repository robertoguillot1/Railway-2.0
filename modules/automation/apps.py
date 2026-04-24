from django.apps import AppConfig

class AutomationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'modules.automation'
    verbose_name = 'Automatización y Lecturas'

    def ready(self):
        import modules.automation.signals
