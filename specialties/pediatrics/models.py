from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class GrowthRecord(TenantModel):
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="growth_records",
    )
    record_date = models.DateField()
    age_months = models.PositiveSmallIntegerField(null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    head_circumference_cm = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "pediatrics_growth_record"
        indexes = [models.Index(fields=["clinic", "patient", "record_date"])]


class Immunization(TenantModel):
    """Vaccine doses — core pediatric EMR feature (Bright Futures / EPI style)."""

    class Status(models.TextChoices):
        GIVEN = "given", "Given"
        DUE = "due", "Due"
        OVERDUE = "overdue", "Overdue"
        SKIPPED = "skipped", "Skipped"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="immunizations",
    )
    vaccine_name = models.CharField(max_length=120)
    dose_number = models.PositiveSmallIntegerField(default=1)
    scheduled_date = models.DateField(null=True, blank=True)
    given_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DUE)
    lot_number = models.CharField(max_length=80, blank=True)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "pediatrics_immunization"
        indexes = [models.Index(fields=["clinic", "patient", "status"])]
