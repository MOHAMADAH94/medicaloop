from rest_framework import serializers

from specialties.dermatology.models import SkinCase


class SkinCaseSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = SkinCase
        fields = (
            "id",
            "patient",
            "patient_name",
            "case_date",
            "body_area",
            "diagnosis",
            "treatment_plan",
            "severity",
            "status",
            "notes",
            "visibility",
            "created_at",
        )
        read_only_fields = ("created_at",)
