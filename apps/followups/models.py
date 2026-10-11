from django.db import models

from apps.core.constants import FollowUpStatus
from apps.tenancy.models import TenantModel


class FollowUpPlan(TenantModel):
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="followup_plans",
    )
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="followup_plans",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "followups_plan"


class FollowUpItem(TenantModel):
    plan = models.ForeignKey(
        FollowUpPlan,
        on_delete=models.CASCADE,
        related_name="items",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="followup_items",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=FollowUpStatus.choices,
        default=FollowUpStatus.PENDING,
    )
    assigned_to = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_followups",
    )
    patient_visible = models.BooleanField(default=False)
    doctor_notes = models.TextField(blank=True)
    patient_instructions = models.TextField(blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "followups_item"
        indexes = [models.Index(fields=["clinic", "status", "due_date"])]

    def save(self, *args, **kwargs):
        if self.plan_id:
            self.clinic_id = self.plan.clinic_id
            if not self.patient_id:
                self.patient_id = self.plan.patient_id
        super().save(*args, **kwargs)
