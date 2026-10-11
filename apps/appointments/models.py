from django.db import models

from apps.core.constants import AppointmentStatus
from apps.tenancy.models import TenantModel


class Appointment(TenantModel):
    """Scheduled appointment between patient and clinic."""

    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    doctor = models.ForeignKey(
        "tenancy.DoctorProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
    )
    service = models.ForeignKey(
        "tenancy.ClinicService",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
    )
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices,
        default=AppointmentStatus.PENDING,
    )
    notes = models.TextField(blank=True)
    cancellation_reason = models.TextField(blank=True)
    rescheduled_from = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rescheduled_to",
    )
    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_appointments",
    )

    class Meta:
        db_table = "appointments_appointment"
        indexes = [
            models.Index(fields=["clinic", "scheduled_start"]),
            models.Index(fields=["clinic", "status"]),
            models.Index(fields=["patient", "scheduled_start"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "doctor", "scheduled_start"],
                condition=~models.Q(status=AppointmentStatus.CANCELLED),
                name="unique_active_appointment_slot",
            ),
        ]

    def __str__(self):
        return f"{self.patient} @ {self.scheduled_start}"
