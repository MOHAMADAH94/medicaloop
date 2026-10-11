from django.db import models

from apps.core.constants import NotificationType
from apps.core.models import BaseModel


class Notification(BaseModel):
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    clinic = models.ForeignKey(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True,
    )
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    title = models.CharField(max_length=255)
    body = models.TextField()
    read_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = "notifications_notification"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "read_at", "created_at"]),
        ]


class NotificationPreference(BaseModel):
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    in_app_enabled = models.BooleanField(default=True)

    class Meta:
        db_table = "notifications_preference"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "notification_type"],
                name="unique_notification_preference",
            ),
        ]
