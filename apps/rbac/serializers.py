from rest_framework import serializers

from .models import Permission, Role


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ("id", "codename", "name", "description", "module")


class RoleSerializer(serializers.ModelSerializer):
    permission_codenames = serializers.SlugRelatedField(
        source="permissions",
        slug_field="codename",
        many=True,
        queryset=Permission.objects.all(),
        required=False,
    )
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Role
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "is_system",
            "permission_codenames",
            "member_count",
        )
        read_only_fields = ("id", "is_system", "member_count")

    def validate_slug(self, value):
        clinic = self.context.get("clinic")
        qs = Role.objects.filter(clinic=clinic, slug=value)
        if self.instance is not None:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A role with this slug already exists for this clinic.")
        return value
