from rest_framework import viewsets

from apps.prescriptions.models import Prescription
from apps.prescriptions.serializers import PrescriptionSerializer
from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember


class PrescriptionViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("prescriptions.create")]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        qs = super().get_queryset().prefetch_related("items")
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())
