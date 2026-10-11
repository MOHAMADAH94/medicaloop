from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.constants import UserType
from apps.patients.models import PatientClinicLink
from apps.patients.serializers import PatientSerializer
from apps.records.services.timeline_service import TimelineService


class IsPatientUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.user_type == UserType.PATIENT


class PatientProfileView(APIView):
    permission_classes = [IsPatientUser]

    def get(self, request):
        patient = getattr(request.user, "patient_profile", None)
        if not patient:
            return Response({"detail": "No patient profile."}, status=404)
        return Response(PatientSerializer(patient).data)

    def patch(self, request):
        patient = getattr(request.user, "patient_profile", None)
        if not patient:
            return Response({"detail": "No patient profile."}, status=404)
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PatientTimelineView(APIView):
    permission_classes = [IsPatientUser]

    def get(self, request):
        patient = getattr(request.user, "patient_profile", None)
        clinic_id = request.query_params.get("clinic_id")
        if not patient or not clinic_id:
            return Response({"detail": "clinic_id required."}, status=400)

        if not PatientClinicLink.objects.filter(patient=patient, clinic_id=clinic_id, is_active=True).exists():
            return Response({"detail": "Not linked to clinic."}, status=403)

        from apps.tenancy.models import Clinic

        clinic = Clinic.objects.get(id=clinic_id)
        service = TimelineService(patient, clinic, patient_visible_only=True)
        return Response(service.get_timeline())
