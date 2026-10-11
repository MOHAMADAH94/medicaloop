from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.core.constants import UserType
from apps.rbac.models import Role

from .models import ClinicMembership

User = get_user_model()


class TeamRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ("id", "name", "slug", "is_system")


class ClinicMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    role_details = TeamRoleSerializer(source="roles", many=True, read_only=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        source="roles",
        queryset=Role.objects.all(),
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = ClinicMembership
        fields = (
            "id",
            "username",
            "full_name",
            "email",
            "phone",
            "job_title",
            "is_owner",
            "is_active",
            "role_details",
            "role_ids",
            "created_at",
        )
        read_only_fields = ("id", "is_owner", "created_at")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        assignable = self.context.get("assignable_roles")
        if assignable is not None:
            self.fields["role_ids"].child_relation.queryset = assignable


class InviteMemberSerializer(serializers.Serializer):
    """Create (or attach) a staff user and grant them clinic membership."""

    username = serializers.RegexField(
        r"^[a-zA-Z0-9_\u0600-\u06FF]+$", min_length=3, max_length=150
    )
    password = serializers.CharField(min_length=8, write_only=True, required=False)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    job_title = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role_ids = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), many=True, required=False
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        assignable = self.context.get("assignable_roles")
        if assignable is not None:
            self.fields["role_ids"].child_relation.queryset = assignable

    def validate_username(self, value):
        return User.normalize_username(value)

    def validate(self, attrs):
        existing = User.objects.filter(username=attrs["username"]).first()

        if existing is None and not attrs.get("password"):
            raise serializers.ValidationError(
                {"password": "Password is required when creating a new staff account."}
            )

        if existing is not None and existing.user_type != UserType.STAFF:
            raise serializers.ValidationError(
                {"username": "This account belongs to a patient and cannot join the team."}
            )

        attrs["_existing_user"] = existing
        return attrs
