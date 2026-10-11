from django.urls import include, path
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.routers import DefaultRouter

from apps.appointments.models import Appointment
from apps.appointments.serializers import AppointmentSerializer
from apps.core.constants import UserType, Visibility
from apps.files.models import FileAsset
from apps.files.serializers import FileAssetSerializer
from apps.followups.models import FollowUpItem
from apps.followups.serializers import FollowUpItemSerializer
from apps.notifications.views import NotificationViewSet
from apps.patients.views_patient import PatientProfileView, PatientTimelineView
from apps.prescriptions.models import Prescription
from apps.prescriptions.serializers import PrescriptionSerializer


class IsPatientUser(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.user_type == UserType.PATIENT


class PatientAppointmentViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsPatientUser]
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        patient = getattr(self.request.user, "patient_profile", None)
        if not patient:
            return Appointment.objects.none()
        return Appointment.objects.filter(patient=patient).exclude(
            status="cancelled"
        ).order_by("-scheduled_start")


class PatientPrescriptionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsPatientUser]
    serializer_class = PrescriptionSerializer

    def get_queryset(self):
        patient = getattr(self.request.user, "patient_profile", None)
        if not patient:
            return Prescription.objects.none()
        return Prescription.objects.filter(
            patient=patient, visibility=Visibility.PATIENT_VISIBLE
        ).prefetch_related("items")


class PatientFileViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsPatientUser]
    serializer_class = FileAssetSerializer

    def get_queryset(self):
        patient = getattr(self.request.user, "patient_profile", None)
        if not patient:
            return FileAsset.objects.none()
        return FileAsset.objects.filter(
            patient=patient, visibility=Visibility.PATIENT_VISIBLE
        )


class PatientFollowUpViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsPatientUser]
    serializer_class = FollowUpItemSerializer

    def get_queryset(self):
        patient = getattr(self.request.user, "patient_profile", None)
        if not patient:
            return FollowUpItem.objects.none()
        return FollowUpItem.objects.filter(patient=patient, patient_visible=True)


router = DefaultRouter()
router.register("appointments", PatientAppointmentViewSet, basename="patient-appointments")
router.register("prescriptions", PatientPrescriptionViewSet, basename="patient-prescriptions")
router.register("files", PatientFileViewSet, basename="patient-files")
router.register("followups", PatientFollowUpViewSet, basename="patient-followups")
router.register("notifications", NotificationViewSet, basename="patient-notifications")

urlpatterns = [
    path("profile/", PatientProfileView.as_view(), name="patient-profile"),
    path("timeline/", PatientTimelineView.as_view(), name="patient-timeline"),
    path("", include(router.urls)),
]
