from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class Prescription(TenantModel):
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.CASCADE,
        related_name="prescriptions",
        null=True,
        blank=True,
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="prescriptions",
    )
    doctor = models.ForeignKey(
        "tenancy.DoctorProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prescriptions",
    )
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PATIENT_VISIBLE,
    )

    class Meta:
        db_table = "prescriptions_prescription"


class PrescriptionItem(TenantModel):
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="items",
    )
    medication_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100, blank=True)
    frequency = models.CharField(max_length=100, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    instructions = models.TextField(blank=True)

    class Meta:
        db_table = "prescriptions_prescription_item"

    def save(self, *args, **kwargs):
        if self.prescription_id:
            self.clinic_id = self.prescription.clinic_id
        super().save(*args, **kwargs)
