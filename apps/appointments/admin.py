from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("patient", "clinic", "scheduled_start", "scheduled_end", "status")
    list_filter = ("status", "clinic")
    search_fields = ("patient__first_name", "patient__last_name")
    date_hierarchy = "scheduled_start"
