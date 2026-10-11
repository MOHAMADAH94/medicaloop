from rest_framework import serializers

from apps.appointments.models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source="patient.full_name", read_only=True)

    class Meta:
        model = Appointment
        fields = (
            "id",
            "patient",
            "patient_name",
            "doctor",
            "service",
            "scheduled_start",
            "scheduled_end",
            "status",
            "notes",
            "cancellation_reason",
            "created_at",
        )
        read_only_fields = ("scheduled_end", "created_at")
