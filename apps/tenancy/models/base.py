from django.db import models

from apps.core.models import BaseModel


class TenantQuerySet(models.QuerySet):
    """QuerySet that supports clinic-scoped filtering."""

    def for_clinic(self, clinic):
        return self.filter(clinic=clinic)


class TenantManager(models.Manager):
    """Manager that exposes tenant-scoped query helpers."""

    def get_queryset(self):
        return TenantQuerySet(self.model, using=self._db)

    def for_clinic(self, clinic):
        return self.get_queryset().for_clinic(clinic)


class TenantModel(BaseModel):
    """
    Abstract base for all clinic-scoped models.
    Every tenant table MUST inherit from this.
    """

    clinic = models.ForeignKey(
        "tenancy.Clinic",
        on_delete=models.CASCADE,
        related_name="%(class)s_set",
    )

    objects = TenantManager()

    class Meta:
        abstract = True
