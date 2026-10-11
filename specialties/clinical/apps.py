from django.apps import AppConfig


class ClinicalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "specialties.clinical"
    label = "specialty_clinical"
    verbose_name = "Specialty Clinical Records"
