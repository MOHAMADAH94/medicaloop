from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.appointments.models import Appointment
from apps.core.constants import AppointmentStatus, FollowUpStatus
from apps.followups.models import FollowUpItem
from apps.patients.models import PatientClinicLink
from apps.tenancy.permissions import IsClinicMember
from apps.tenancy.serializers import ClinicSerializer
from specialties.base.dashboard import build_specialty_metrics
from apps.tenancy.theme import clinic_branding
from specialties.base.pack import pack_public_dict
from specialties.base.services import get_display_name, list_modules, module_to_dict


class DashboardSummaryView(APIView):
    permission_classes = [IsClinicMember]

    def get(self, request):
        clinic = request.clinic
        today = timezone.localdate()

        today_appointments = (
            Appointment.objects.filter(clinic=clinic, scheduled_start__date=today)
            .exclude(status=AppointmentStatus.CANCELLED)
            .count()
        )
        pending = Appointment.objects.filter(clinic=clinic, status=AppointmentStatus.PENDING).count()
        overdue_followups = FollowUpItem.objects.filter(
            clinic=clinic,
            status__in=[FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
            due_date__lt=today,
        ).count()
        total_patients = PatientClinicLink.objects.filter(clinic=clinic, is_active=True).count()

        specialty = build_specialty_metrics(clinic)

        return Response(
            {
                "today_appointments": today_appointments,
                "pending_bookings": pending,
                "overdue_followups": overdue_followups,
                "total_patients": total_patients,
                "specialty_code": clinic.specialty_code,
                "specialty_metrics": specialty["metrics"],
                "specialty_branding": specialty["branding"],
                "visit_templates": specialty["visit_templates"],
                "clinical_modules": specialty["clinical_modules"],
            }
        )


class ClinicDetailView(APIView):
    permission_classes = [IsClinicMember]

    def get(self, request):
        clinic = request.clinic
        if clinic is None:
            return Response({"detail": "No active clinic."}, status=404)

        data = ClinicSerializer(clinic).data
        data["specialty"] = get_display_name(clinic.specialty_code, lang="ar")
        data["specialty_name"] = data["specialty"]
        data["specialty_modules"] = [
            module_to_dict(m, active_code=clinic.specialty_code) for m in list_modules()
        ]
        data["branding"] = clinic_branding(clinic)
        data["specialty_pack"] = pack_public_dict(clinic.specialty_code)
        return Response(data)
