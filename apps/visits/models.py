from django.db import models

from apps.core.constants import VisitStatus
from apps.tenancy.models import TenantModel


class Visit(TenantModel):
    """Clinical visit — anchor for medical timeline entries."""

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="visits",
    )
    appointment = models.OneToOneField(
        "appointments.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visit",
    )
    doctor = models.ForeignKey(
        "tenancy.DoctorProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="visits",
    )
    visit_date = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=VisitStatus.choices,
        default=VisitStatus.IN_PROGRESS,
    )
    chief_complaint = models.TextField(blank=True)
    symptoms = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    patient_instructions = models.TextField(blank=True)
    patient_instructions_visible = models.BooleanField(default=False)

    class Meta:
        db_table = "visits_visit"
        indexes = [
            models.Index(fields=["clinic", "visit_date"]),
            models.Index(fields=["patient", "visit_date"]),
        ]
