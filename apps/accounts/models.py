from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.core.constants import UserType
from apps.core.models import TimestampedModel, UUIDModel

from .managers import UserManager


class User(UUIDModel, AbstractBaseUser, PermissionsMixin, TimestampedModel):
    """Platform user — staff members and patients share this identity table."""

    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(blank=True, default="")
    phone = models.CharField(max_length=20, blank=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    user_type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.STAFF,
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    language = models.CharField(max_length=5, default="ar")

    objects = UserManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "accounts_user"
        indexes = [
            models.Index(fields=["username"]),
            models.Index(fields=["user_type"]),
        ]

    def __str__(self):
        return self.username

    @classmethod
    def normalize_username(cls, username):
        return username.strip().lower()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username
