from rest_framework import serializers

from specialties.pediatrics.models import GrowthRecord, Immunization


class GrowthRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = GrowthRecord
        fields = (
            "id",
            "patient",
            "patient_name",
            "record_date",
            "age_months",
            "weight_kg",
            "height_cm",
            "head_circumference_cm",
            "notes",
            "visibility",
            "created_at",
        )
        read_only_fields = ("created_at",)


class ImmunizationSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Immunization
        fields = (
            "id",
            "patient",
            "patient_name",
            "vaccine_name",
            "dose_number",
            "scheduled_date",
            "given_date",
            "status",
            "lot_number",
            "notes",
            "visibility",
            "created_at",
        )
        read_only_fields = ("created_at",)
