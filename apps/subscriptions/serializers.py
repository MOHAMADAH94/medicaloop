from rest_framework import serializers

from apps.subscriptions.models import ClinicSubscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ("id", "name", "slug", "description", "price_monthly", "trial_days", "max_patients", "max_staff")


class ClinicSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = ClinicSubscription
        fields = ("id", "plan", "status", "trial_ends_at", "current_period_start", "current_period_end")
