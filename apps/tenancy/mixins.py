from django.core.exceptions import FieldDoesNotExist

from .permissions import IsClinicMember


def model_has_clinic_field(model) -> bool:
    try:
        model._meta.get_field("clinic")
    except FieldDoesNotExist:
        return False
    return True


class TenantViewSetMixin:
    """
    Mixin for staff ViewSets that enforces clinic-scoped querysets.
    All tenant data access MUST use this mixin.

    Scoping is fail-closed: without a resolved clinic nothing is returned, and
    any model carrying a `clinic` field is filtered even when it does not use
    TenantManager.
    """

    permission_classes = [IsClinicMember]

    def get_clinic(self):
        return getattr(self.request, "clinic", None)

    def get_queryset(self):
        qs = super().get_queryset()
        clinic = self.get_clinic()

        if clinic is None:
            return qs.none()

        if hasattr(qs, "for_clinic"):
            return qs.for_clinic(clinic)

        if model_has_clinic_field(qs.model):
            return qs.filter(clinic=clinic)

        return qs

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())
