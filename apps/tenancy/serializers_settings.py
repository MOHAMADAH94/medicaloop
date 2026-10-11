from rest_framework import serializers

from apps.tenancy.models import (
    ClinicHoliday,
    ClinicService,
    ClinicSettings,
    DoctorProfile,
    WorkingHours,
)
from apps.tenancy.theme import THEME_COLOR_RE


class ClinicSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicSettings
        fields = (
            "appointment_duration_minutes",
            "max_daily_appointments",
            "auto_confirm_appointments",
            "cancellation_hours_before",
            "allow_patient_reschedule",
            "onboarding_completed",
            "theme_color",
        )

    def validate_theme_color(self, value):
        color = (value or "").strip()
        if not color:
            return ""
        if not color.startswith("#"):
            color = f"#{color}"
        color = color.upper()
        if not THEME_COLOR_RE.match(color):
            raise serializers.ValidationError("Use a hex color like #1565C0.")
        return color


class WorkingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkingHours
        fields = ("id", "day_of_week", "start_time", "end_time", "doctor", "is_active")


class ClinicHolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicHoliday
        fields = ("id", "date", "reason")


class ClinicServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClinicService
        fields = ("id", "name", "description", "price", "duration_minutes", "is_public", "is_active")


class DoctorProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = DoctorProfile
        fields = ("id", "full_name", "specialty", "bio", "photo", "license_number", "is_public")
