from rest_framework import serializers

from specialties.dental.models import DentalTreatment


class DentalTreatmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = DentalTreatment
        fields = (
            "id",
            "patient",
            "patient_name",
            "treatment_date",
            "tooth_number",
            "procedure",
            "status",
            "notes",
            "visibility",
            "created_at",
        )
        read_only_fields = ("created_at",)
