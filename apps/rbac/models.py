from django.db import models

from apps.core.models import BaseModel


class Permission(BaseModel):
    """Platform permission codename (e.g. patients.view)."""

    codename = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    module = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = "rbac_permission"
        ordering = ["module", "codename"]

    def __str__(self):
        return self.codename


class Role(BaseModel):
    """Clinic-scoped or global template role."""

    clinic = models.ForeignKey(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="roles",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=False)
    permissions = models.ManyToManyField(Permission, blank=True, related_name="roles")

    class Meta:
        db_table = "rbac_role"
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "slug"],
                name="unique_role_slug_per_clinic",
            ),
        ]

    def __str__(self):
        return self.name
