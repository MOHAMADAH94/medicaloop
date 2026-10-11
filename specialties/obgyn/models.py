from django.db import models

from apps.core.constants import PregnancyStatus, Visibility
from apps.tenancy.models import TenantModel


class Pregnancy(TenantModel):
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="pregnancies",
    )
    lmp_date = models.DateField(null=True, blank=True)
    edd_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PregnancyStatus.choices,
        default=PregnancyStatus.ACTIVE,
    )
    risk_level = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)
    patient_portal_enabled = models.BooleanField(default=False)

    class Meta:
        db_table = "obgyn_pregnancy"
        indexes = [models.Index(fields=["clinic", "patient", "status"])]


class PregnancyVisit(TenantModel):
    pregnancy = models.ForeignKey(
        Pregnancy,
        on_delete=models.CASCADE,
        related_name="visits",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="pregnancy_visits",
    )
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    visit_date = models.DateField()
    gestational_age_weeks = models.PositiveSmallIntegerField(null=True, blank=True)
    gestational_age_days = models.PositiveSmallIntegerField(null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_pressure = models.CharField(max_length=20, blank=True)
    fundal_height = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    fetal_heart_rate = models.PositiveSmallIntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )

    class Meta:
        db_table = "obgyn_pregnancy_visit"

    def save(self, *args, **kwargs):
        if self.pregnancy_id:
            self.clinic_id = self.pregnancy.clinic_id
            if not self.patient_id:
                self.patient_id = self.pregnancy.patient_id
        super().save(*args, **kwargs)


class UltrasoundRecord(TenantModel):
    pregnancy = models.ForeignKey(
        Pregnancy,
        on_delete=models.CASCADE,
        related_name="ultrasounds",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="ultrasounds",
    )
    date = models.DateField()
    findings = models.TextField(blank=True)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )

    class Meta:
        db_table = "obgyn_ultrasound"

    def save(self, *args, **kwargs):
        if self.pregnancy_id:
            self.clinic_id = self.pregnancy.clinic_id
            if not self.patient_id:
                self.patient_id = self.pregnancy.patient_id
        super().save(*args, **kwargs)


class RiskFactor(TenantModel):
    pregnancy = models.ForeignKey(
        Pregnancy,
        on_delete=models.CASCADE,
        related_name="risk_factors",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="risk_factors",
    )
    name = models.CharField(max_length=255)
    severity = models.CharField(max_length=50, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "obgyn_risk_factor"

    def save(self, *args, **kwargs):
        if self.pregnancy_id:
            self.clinic_id = self.pregnancy.clinic_id
            if not self.patient_id:
                self.patient_id = self.pregnancy.patient_id
        super().save(*args, **kwargs)


class DeliveryRecord(TenantModel):
    pregnancy = models.OneToOneField(
        Pregnancy,
        on_delete=models.CASCADE,
        related_name="delivery",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="deliveries",
    )
    delivery_date = models.DateTimeField()
    delivery_type = models.CharField(max_length=50, blank=True)
    complications = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "obgyn_delivery"

    def save(self, *args, **kwargs):
        if self.pregnancy_id:
            self.clinic_id = self.pregnancy.clinic_id
            if not self.patient_id:
                self.patient_id = self.pregnancy.patient_id
        super().save(*args, **kwargs)
