from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer
from apps.appointments.services.booking import BookingService
from apps.audit.services import log_action
from apps.core.constants import AppointmentStatus
from apps.notifications.services.notification_service import NotificationService
from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember


class AppointmentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("appointments.view")]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        qs = super().get_queryset().select_related("patient", "doctor")
        status_filter = self.request.query_params.get("status")
        date_filter = self.request.query_params.get("date")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if date_filter:
            qs = qs.filter(scheduled_start__date=date_filter)
        return qs.order_by("scheduled_start")

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "confirm", "cancel"):
            return [IsClinicMember(), make_permission_class("appointments.create")()]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        start = serializer.validated_data["scheduled_start"]
        booking = BookingService(self.get_clinic())
        try:
            appointment = booking.create_appointment(
                patient=serializer.validated_data["patient"],
                scheduled_start=start,
                doctor=serializer.validated_data.get("doctor"),
                service=serializer.validated_data.get("service"),
                created_by=request.user,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        NotificationService.notify_appointment_created(appointment)
        log_action(
            clinic=self.get_clinic(),
            actor=request.user,
            action="appointment.created",
            resource_type="Appointment",
            resource_id=appointment.id,
        )
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = AppointmentStatus.CONFIRMED
        appointment.save(update_fields=["status", "updated_at"])
        NotificationService.notify_appointment_confirmed(appointment)
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        appointment = self.get_object()
        appointment.status = AppointmentStatus.CANCELLED
        appointment.cancellation_reason = request.data.get("reason", "")
        appointment.save(update_fields=["status", "cancellation_reason", "updated_at"])
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=["get"])
    def today(self, request):
        from django.utils import timezone

        qs = self.get_queryset().filter(scheduled_start__date=timezone.localdate())
        return Response(AppointmentSerializer(qs, many=True).data)
