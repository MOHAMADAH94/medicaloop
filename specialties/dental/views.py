from rest_framework import viewsets

from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember
from specialties.dental.models import DentalTreatment
from specialties.dental.serializers import DentalTreatmentSerializer


class DentalTreatmentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = DentalTreatment.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("dental.treatment.view")]
    serializer_class = DentalTreatmentSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related("patient")
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-treatment_date")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsClinicMember(), make_permission_class("dental.treatment.edit")()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())
