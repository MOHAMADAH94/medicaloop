from rest_framework import serializers

from apps.followups.models import FollowUpItem, FollowUpPlan


class FollowUpItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FollowUpItem
        fields = (
            "id",
            "plan",
            "title",
            "description",
            "due_date",
            "status",
            "assigned_to",
            "patient_visible",
            "doctor_notes",
            "patient_instructions",
            "completed_at",
        )


class FollowUpPlanSerializer(serializers.ModelSerializer):
    items = FollowUpItemSerializer(many=True, read_only=True)

    class Meta:
        model = FollowUpPlan
        fields = ("id", "patient", "visit", "title", "description", "is_active", "items", "created_at")
