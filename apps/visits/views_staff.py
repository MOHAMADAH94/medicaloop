from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.audit.services import log_action
from apps.core.constants import AppointmentStatus, VisitStatus
from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember
from apps.visits.models import Visit
from apps.visits.serializers import VisitSerializer


class VisitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Visit.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("medical_records.view")]
    serializer_class = VisitSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related("patient", "doctor")
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-visit_date")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "complete"):
            return [IsClinicMember(), make_permission_class("medical_records.create")()]
        return super().get_permissions()

    def perform_create(self, serializer):
        visit = serializer.save(clinic=self.get_clinic())
        if visit.appointment_id:
            visit.appointment.status = AppointmentStatus.IN_PROGRESS
            visit.appointment.save(update_fields=["status", "updated_at"])
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="visit.created",
            resource_type="Visit",
            resource_id=visit.id,
        )

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        visit = self.get_object()
        visit.status = VisitStatus.COMPLETED
        visit.save(update_fields=["status", "updated_at"])
        if visit.appointment_id:
            visit.appointment.status = AppointmentStatus.COMPLETED
            visit.appointment.save(update_fields=["status", "updated_at"])
        return Response(VisitSerializer(visit).data)

    @action(detail=False, methods=["post"])
    def start_from_appointment(self, request):
        from django.utils import timezone

        from apps.appointments.models import Appointment

        appointment_id = request.data.get("appointment_id")
        appointment = Appointment.objects.filter(
            clinic=self.get_clinic(), id=appointment_id
        ).first()
        if not appointment:
            return Response({"detail": "Appointment not found."}, status=404)

        visit, created = Visit.objects.get_or_create(
            clinic=self.get_clinic(),
            appointment=appointment,
            defaults={
                "patient": appointment.patient,
                "doctor": appointment.doctor,
                "visit_date": timezone.now(),
            },
        )
        appointment.status = AppointmentStatus.IN_PROGRESS
        appointment.save(update_fields=["status", "updated_at"])
        return Response(VisitSerializer(visit).data, status=201 if created else 200)
