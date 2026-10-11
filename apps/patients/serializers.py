from rest_framework import serializers

from apps.patients.models import Patient, PatientClinicLink


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    clinic_links = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = (
            "id",
            "first_name",
            "last_name",
            "full_name",
            "date_of_birth",
            "gender",
            "phone",
            "email",
            "address",
            "allergies",
            "chronic_conditions",
            "current_medications",
            "medical_history",
            "emergency_contact_name",
            "emergency_contact_phone",
            "clinic_links",
            "created_at",
        )

    def get_clinic_links(self, obj):
        return [
            {"clinic_id": str(link.clinic_id), "clinic_name": link.clinic.name}
            for link in obj.clinic_links.filter(is_active=True).select_related("clinic")
        ]


class PatientClinicLinkSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = PatientClinicLink
        fields = ("id", "patient", "patient_id", "medical_record_number", "is_active", "registered_at")
