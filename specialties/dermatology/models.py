from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class SkinCase(TenantModel):
    class Severity(models.TextChoices):
        MILD = "mild", "Mild"
        MODERATE = "moderate", "Moderate"
        SEVERE = "severe", "Severe"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        RESOLVED = "resolved", "Resolved"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="skin_cases",
    )
    case_date = models.DateField()
    body_area = models.CharField(max_length=120)
    diagnosis = models.CharField(max_length=255)
    treatment_plan = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MILD)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "dermatology_skin_case"
        indexes = [models.Index(fields=["clinic", "patient", "case_date"])]
