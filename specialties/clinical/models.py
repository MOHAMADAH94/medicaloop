from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class SpecialtyRecord(TenantModel):
    """Generic clinical record for extended specialty modules."""

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        FOLLOW_UP = "follow_up", "Follow up"
        COMPLETED = "completed", "Completed"
        ON_HOLD = "on_hold", "On hold"

    specialty_code = models.CharField(max_length=50, db_index=True)
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="specialty_records",
    )
    record_date = models.DateField()
    title = models.CharField(max_length=255)
    diagnosis = models.CharField(max_length=255, blank=True)
    findings = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    severity = models.CharField(max_length=20, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "specialty_clinical_record"
        indexes = [
            models.Index(fields=["clinic", "specialty_code", "patient", "record_date"]),
            models.Index(fields=["clinic", "specialty_code", "status"]),
        ]
