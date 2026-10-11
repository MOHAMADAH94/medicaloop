from django.apps import AppConfig


class SpecialtyBaseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "specialties.base"
    label = "specialty_base"
    verbose_name = "Specialty Base"

    def ready(self):
        from specialties.base.bootstrap import register_specialties

        register_specialties()
