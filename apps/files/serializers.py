from rest_framework import serializers

from apps.files.models import FileAsset


class FileAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAsset
        fields = (
            "id",
            "patient",
            "visit",
            "original_name",
            "category",
            "mime_type",
            "size_bytes",
            "visibility",
            "description",
            "created_at",
        )
        read_only_fields = ("original_name", "mime_type", "size_bytes", "created_at")
