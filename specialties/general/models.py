from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class CarePlan(TenantModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        ON_HOLD = "on_hold", "On hold"

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="care_plans",
    )
    title = models.CharField(max_length=255)
    condition = models.CharField(max_length=255, blank=True)
    care_plan = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    start_date = models.DateField()
    review_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "general_care_plan"
        indexes = [models.Index(fields=["clinic", "patient", "start_date"])]
