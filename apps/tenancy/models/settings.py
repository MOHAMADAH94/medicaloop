from django.db import models

from apps.core.models import BaseModel


class ClinicSettings(BaseModel):
    """Clinic operational settings."""

    clinic = models.OneToOneField(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="settings",
    )
    appointment_duration_minutes = models.PositiveIntegerField(default=30)
    max_daily_appointments = models.PositiveIntegerField(default=20)
    auto_confirm_appointments = models.BooleanField(default=False)
    cancellation_hours_before = models.PositiveIntegerField(default=24)
    allow_patient_reschedule = models.BooleanField(default=True)
    onboarding_completed = models.BooleanField(default=False)
    theme_color = models.CharField(
        max_length=7,
        blank=True,
        default="",
        verbose_name="لون الواجهة",
        help_text="لون أساسي مخصص بهيئة #RRGGBB. اتركه فارغاً لاستخدام لون التخصص.",
    )

    class Meta:
        db_table = "tenancy_clinic_settings"


class WorkingHours(BaseModel):
    """Weekly working hours per clinic (optionally per doctor)."""

    clinic = models.ForeignKey(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="working_hours",
    )
    doctor = models.ForeignKey(
        "tenancy.DoctorProfile",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="working_hours",
    )
    day_of_week = models.PositiveSmallIntegerField()  # 0=Monday
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "tenancy_working_hours"
        ordering = ["day_of_week", "start_time"]
        indexes = [models.Index(fields=["clinic", "day_of_week"])]


class ClinicHoliday(BaseModel):
    """Clinic closed dates."""

    clinic = models.ForeignKey(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="holidays",
    )
    date = models.DateField()
    reason = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "tenancy_clinic_holiday"
        ordering = ["date"]
        constraints = [
            models.UniqueConstraint(fields=["clinic", "date"], name="unique_clinic_holiday"),
        ]


class ClinicService(BaseModel):
    """Services offered by clinic (public + billing)."""

    clinic = models.ForeignKey(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="services",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration_minutes = models.PositiveIntegerField(default=30)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "tenancy_clinic_service"
        ordering = ["name"]
