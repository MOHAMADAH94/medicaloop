from rest_framework import serializers

from specialties.clinical.models import SpecialtyRecord


class SpecialtyRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = SpecialtyRecord
        fields = (
            "id",
            "specialty_code",
            "patient",
            "patient_name",
            "record_date",
            "title",
            "diagnosis",
            "findings",
            "treatment_plan",
            "status",
            "severity",
            "metadata",
            "notes",
            "visibility",
            "created_at",
        )
        read_only_fields = ("created_at", "specialty_code")
