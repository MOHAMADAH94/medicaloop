from rest_framework import serializers

from specialties.general.models import CarePlan


class CarePlanSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = CarePlan
        fields = (
            "id",
            "patient",
            "patient_name",
            "title",
            "condition",
            "care_plan",
            "status",
            "start_date",
            "review_date",
            "notes",
            "visibility",
            "created_at",
        )
        read_only_fields = ("created_at",)
