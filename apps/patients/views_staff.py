from django.db import transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.services import log_action
from apps.patients.models import Patient, PatientClinicLink
from apps.patients.serializers import PatientSerializer
from apps.rbac.permissions import make_permission_class
from apps.records.services.timeline_service import TimelineService
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember


class PatientViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("patients.view")]
    serializer_class = PatientSerializer

    def get_queryset(self):
        clinic = self.get_clinic()
        patient_ids = PatientClinicLink.objects.filter(
            clinic=clinic, is_active=True
        ).values_list("patient_id", flat=True)
        return Patient.objects.filter(id__in=patient_ids)

    def get_permissions(self):
        if self.action == "create":
            return [IsClinicMember(), make_permission_class("patients.create")()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsClinicMember(), make_permission_class("patients.edit")()]
        return super().get_permissions()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        clinic = self.get_clinic()
        serializer = PatientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save()
        PatientClinicLink.objects.create(clinic=clinic, patient=patient)
        log_action(
            clinic=clinic,
            actor=request.user,
            action="patient.created",
            resource_type="Patient",
            resource_id=patient.id,
        )
        return Response(PatientSerializer(patient).data, status=status.HTTP_201_CREATED)

    def perform_update(self, serializer):
        patient = serializer.save()
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="patient.updated",
            resource_type="Patient",
            resource_id=patient.id,
        )

    def perform_destroy(self, instance):
        """Unlink the patient from this clinic; the global record is preserved."""
        PatientClinicLink.objects.filter(
            clinic=self.get_clinic(), patient=instance
        ).update(is_active=False)
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="patient.unlinked",
            resource_type="Patient",
            resource_id=instance.id,
        )

    @action(detail=True, methods=["get"])
    def timeline(self, request, pk=None):
        patient = self.get_object()
        service = TimelineService(patient, self.get_clinic())
        return Response(service.get_timeline())
