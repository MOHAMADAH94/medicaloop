from django.db import models

from apps.core.constants import Visibility
from apps.tenancy.models import TenantModel


class FileAsset(TenantModel):
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="files",
    )
    visit = models.ForeignKey(
        "visits.Visit",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="files",
    )
    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_files",
    )
    file = models.FileField(upload_to="medical/%Y/%m/")
    original_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.PositiveIntegerField(default=0)
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )
    description = models.TextField(blank=True)

    class Meta:
        db_table = "files_file_asset"
        indexes = [models.Index(fields=["clinic", "patient"])]
