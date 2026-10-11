from rest_framework import serializers

from apps.tenancy.models import Clinic


class ClinicSerializer(serializers.ModelSerializer):
    specialty_name = serializers.SerializerMethodField()

    class Meta:
        model = Clinic
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "phone",
            "email",
            "address",
            "city",
            "country",
            "timezone",
            "specialty_code",
            "specialty_name",
            "is_active",
            "created_at",
        )
        read_only_fields = fields

    def get_specialty_name(self, obj):
        from specialties.base.services import get_display_name

        return get_display_name(obj.specialty_code)
