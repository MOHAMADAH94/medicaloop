from rest_framework import serializers

from apps.visits.models import Visit


class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = (
            "id",
            "patient",
            "appointment",
            "doctor",
            "visit_date",
            "status",
            "chief_complaint",
            "symptoms",
            "treatment",
            "patient_instructions",
            "patient_instructions_visible",
            "created_at",
        )
