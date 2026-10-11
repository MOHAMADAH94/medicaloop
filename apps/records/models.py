from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class ClinicalNote(TenantModel):
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.CASCADE,
        related_name="notes",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="clinical_notes",
    )
    author = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="clinical_notes",
    )
    content = models.TextField()
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )

    class Meta:
        db_table = "records_clinical_note"


class Diagnosis(TenantModel):
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.CASCADE,
        related_name="diagnoses",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="diagnoses",
    )
    code = models.CharField(max_length=20, blank=True)
    description = models.TextField()
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )
    patient_summary = models.TextField(blank=True)

    class Meta:
        db_table = "records_diagnosis"


class VitalSign(TenantModel):
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.CASCADE,
        related_name="vitals",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="vitals",
    )
    blood_pressure_systolic = models.PositiveSmallIntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.PositiveSmallIntegerField(null=True, blank=True)
    heart_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    temperature = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "records_vital_sign"


class LabRequest(TenantModel):
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.CASCADE,
        related_name="lab_requests",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="lab_requests",
    )
    test_name = models.CharField(max_length=255)
    instructions = models.TextField(blank=True)
    result = models.TextField(blank=True)
    is_published = models.BooleanField(default=False)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )

    class Meta:
        db_table = "records_lab_request"
