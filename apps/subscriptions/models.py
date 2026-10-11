from django.db import models

from apps.core.models import BaseModel


class SubscriptionPlan(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    trial_days = models.PositiveIntegerField(default=14)
    max_patients = models.PositiveIntegerField(null=True, blank=True)
    max_staff = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "subscriptions_plan"


class PlanFeature(BaseModel):
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.CASCADE,
        related_name="features",
    )
    feature_key = models.CharField(max_length=100)
    feature_value = models.CharField(max_length=255, blank=True)
    is_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "subscriptions_plan_feature"
        constraints = [
            models.UniqueConstraint(
                fields=["plan", "feature_key"],
                name="unique_plan_feature",
            ),
        ]


class ClinicSubscription(BaseModel):
    clinic = models.OneToOneField(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="clinic_subscriptions",
    )
    status = models.CharField(max_length=20, default="trial")
    trial_ends_at = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "subscriptions_clinic_subscription"
