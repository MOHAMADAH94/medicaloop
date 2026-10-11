from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class DentalTreatment(TenantModel):
    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="dental_treatments",
    )
    treatment_date = models.DateField()
    tooth_number = models.CharField(max_length=10, blank=True)
    procedure = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNED)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "dental_treatment"
        indexes = [models.Index(fields=["clinic", "patient", "treatment_date"])]
