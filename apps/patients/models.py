from django.db import models

from apps.core.models import BaseModel
from apps.tenancy.models import TenantModel


class Patient(BaseModel):
    """Core patient identity — specialty-agnostic."""

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patient_profile",
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    emergency_contact_name = models.CharField(max_length=150, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)
    allergies = models.TextField(blank=True)
    chronic_conditions = models.TextField(blank=True)
    current_medications = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)

    class Meta:
        db_table = "patients_patient"
        indexes = [
            models.Index(fields=["last_name", "first_name"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class PatientClinicLink(TenantModel):
    """Many-to-many link between patients and clinics."""

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="clinic_links",
    )
    medical_record_number = models.CharField(max_length=50, blank=True)
    is_active = models.BooleanField(default=True)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "patients_clinic_link"
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "patient"],
                name="unique_patient_per_clinic",
            ),
        ]

    def __str__(self):
        return f"{self.patient} @ {self.clinic.name}"
