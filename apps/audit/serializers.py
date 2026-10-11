from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.full_name", read_only=True, default="")
    actor_username = serializers.CharField(source="actor.username", read_only=True, default="")

    class Meta:
        model = AuditLog
        fields = (
            "id",
            "action",
            "resource_type",
            "resource_id",
            "actor_name",
            "actor_username",
            "ip_address",
            "metadata",
            "created_at",
        )
        read_only_fields = fields
