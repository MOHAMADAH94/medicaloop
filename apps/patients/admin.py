from django.contrib import admin

from .models import Patient, PatientClinicLink


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "phone", "email")
    search_fields = ("first_name", "last_name", "phone", "email")


@admin.register(PatientClinicLink)
class PatientClinicLinkAdmin(admin.ModelAdmin):
    list_display = ("patient", "clinic", "is_active", "registered_at")
    list_filter = ("is_active",)
