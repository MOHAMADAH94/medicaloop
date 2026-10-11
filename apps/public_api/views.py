from datetime import timedelta

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.serializers import AppointmentSerializer
from apps.appointments.services.booking import BookingService, SlotService
from apps.core.constants import UserType
from apps.patients.models import PatientClinicLink
from apps.tenancy.models import Clinic, ClinicService, DoctorProfile, WorkingHours
from apps.tenancy.serializers import ClinicSerializer
from apps.tenancy.serializers_settings import (
    ClinicServiceSerializer,
    DoctorProfileSerializer,
    WorkingHoursSerializer,
)
from apps.tenancy.theme import clinic_branding
from specialties.base.pack import pack_public_dict
from specialties.base.services import get_display_name


class PublicClinicView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            clinic = Clinic.objects.select_related("settings").get(slug=slug, is_active=True)
        except Clinic.DoesNotExist:
            return Response({"detail": "Clinic not found."}, status=status.HTTP_404_NOT_FOUND)

        doctors = DoctorProfile.objects.filter(clinic=clinic, is_public=True).select_related("user")
        services = ClinicService.objects.filter(clinic=clinic, is_public=True, is_active=True)
        hours = WorkingHours.objects.filter(clinic=clinic, is_active=True)
        clinic_data = ClinicSerializer(clinic).data
        clinic_data["specialty_name"] = get_display_name(clinic.specialty_code, lang="ar")
        clinic_data["branding"] = clinic_branding(clinic)
        clinic_data["specialty_pack"] = pack_public_dict(clinic.specialty_code)

        return Response({
            "clinic": clinic_data,
            "doctors": DoctorProfileSerializer(doctors, many=True).data,
            "services": ClinicServiceSerializer(services, many=True).data,
            "working_hours": WorkingHoursSerializer(hours, many=True).data,
        })


class PublicSlotsView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            clinic = Clinic.objects.get(slug=slug, is_active=True)
        except Clinic.DoesNotExist:
            return Response({"detail": "Clinic not found."}, status=404)

        date_str = request.query_params.get("date")
        if not date_str:
            return Response({"detail": "date parameter required."}, status=400)

        date = parse_date(date_str)
        doctor_id = request.query_params.get("doctor")
        doctor = None
        if doctor_id:
            doctor = DoctorProfile.objects.filter(clinic=clinic, id=doctor_id).first()

        service = SlotService(clinic)
        slots = service.get_available_slots(date, doctor=doctor)
        return Response({"date": date_str, "slots": slots})


class PublicAvailableDatesView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            clinic = Clinic.objects.get(slug=slug, is_active=True)
        except Clinic.DoesNotExist:
            return Response({"detail": "Clinic not found."}, status=404)

        days = min(int(request.query_params.get("days", 30)), 60)
        service = SlotService(clinic)
        today = timezone.localdate()
        available = []
        working_days = sorted(
            WorkingHours.objects.filter(clinic=clinic, is_active=True)
            .values_list("day_of_week", flat=True)
            .distinct()
        )

        for offset in range(days):
            date = today + timedelta(days=offset)
            if service.get_available_slots(date):
                available.append(str(date))

        return Response({
            "dates": available,
            "working_days": working_days,
        })


class PublicBookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, slug):
        if request.user.user_type != UserType.PATIENT:
            return Response({"detail": "Patient account required."}, status=403)

        try:
            clinic = Clinic.objects.get(slug=slug, is_active=True)
        except Clinic.DoesNotExist:
            return Response({"detail": "Clinic not found."}, status=404)

        patient = getattr(request.user, "patient_profile", None)
        if not patient:
            return Response({"detail": "Patient profile required."}, status=400)

        PatientClinicLink.objects.get_or_create(clinic=clinic, patient=patient)

        start_str = request.data.get("scheduled_start")
        scheduled_start = parse_datetime(start_str)
        if scheduled_start and timezone.is_naive(scheduled_start):
            scheduled_start = timezone.make_aware(scheduled_start)
        if not scheduled_start:
            return Response({"detail": "Invalid scheduled_start."}, status=400)

        doctor = None
        doctor_id = request.data.get("doctor")
        if doctor_id:
            doctor = DoctorProfile.objects.filter(clinic=clinic, id=doctor_id).first()

        service_obj = None
        service_id = request.data.get("service")
        if service_id:
            service_obj = ClinicService.objects.filter(clinic=clinic, id=service_id).first()

        try:
            booking = BookingService(clinic)
            appointment = booking.create_appointment(
                patient=patient,
                scheduled_start=scheduled_start,
                doctor=doctor,
                service=service_obj,
                created_by=request.user,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        from apps.notifications.services.notification_service import NotificationService

        NotificationService.notify_appointment_created(appointment)

        return Response(AppointmentSerializer(appointment).data, status=201)
