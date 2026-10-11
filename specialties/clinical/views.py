from rest_framework import viewsets

from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember
from specialties.base.catalog import clinical_permissions
from specialties.clinical.models import SpecialtyRecord
from specialties.clinical.serializers import SpecialtyRecordSerializer


class SpecialtyRecordViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = SpecialtyRecord.objects.all()
    serializer_class = SpecialtyRecordSerializer
    specialty_code: str = ""

    def get_queryset(self):
        qs = super().get_queryset().select_related("patient")
        if self.specialty_code:
            qs = qs.filter(specialty_code=self.specialty_code)
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        status = self.request.query_params.get("status")
        if status:
            qs = qs.filter(status=status)
        return qs.order_by("-record_date")

    def get_permissions(self):
        view_perm = clinical_permissions(self.specialty_code)[0]
        if self.action in ("create", "update", "partial_update", "destroy"):
            edit_perm = clinical_permissions(self.specialty_code)[1]
            return [IsClinicMember(), make_permission_class(edit_perm)()]
        return [IsClinicMember(), make_permission_class(view_perm)()]

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic(), specialty_code=self.specialty_code)


def make_record_viewset(specialty_code: str):
    return type(
        f"{specialty_code.title()}RecordViewSet",
        (SpecialtyRecordViewSet,),
        {"specialty_code": specialty_code},
    )
