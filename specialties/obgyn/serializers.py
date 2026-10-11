from rest_framework import serializers

from specialties.obgyn.models import Pregnancy, PregnancyVisit, RiskFactor, UltrasoundRecord


class PregnancySerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Pregnancy
        fields = (
            "id",
            "patient",
            "patient_name",
            "lmp_date",
            "edd_date",
            "status",
            "risk_level",
            "notes",
            "patient_portal_enabled",
            "created_at",
        )


class PregnancyVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = PregnancyVisit
        fields = (
            "id",
            "pregnancy",
            "visit_date",
            "gestational_age_weeks",
            "gestational_age_days",
            "weight",
            "blood_pressure",
            "fundal_height",
            "fetal_heart_rate",
            "notes",
            "visibility",
        )


class UltrasoundRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UltrasoundRecord
        fields = ("id", "pregnancy", "date", "findings", "visibility")


class RiskFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskFactor
        fields = ("id", "pregnancy", "name", "severity", "notes")
