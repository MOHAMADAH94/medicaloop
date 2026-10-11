from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.appointments.views_staff import AppointmentViewSet
from apps.audit.views import AuditLogViewSet
from apps.billing.views_staff import InvoiceViewSet, PaymentViewSet
from apps.files.views_staff import FileAssetViewSet
from apps.followups.views_staff import FollowUpItemViewSet, FollowUpPlanViewSet
from apps.notifications.views import NotificationViewSet
from apps.patients.views_staff import PatientViewSet
from apps.prescriptions.views_staff import PrescriptionViewSet
from apps.rbac.views import MyPermissionsView, PermissionListView, RoleViewSet
from apps.subscriptions.views import ClinicSubscriptionView
from apps.tenancy.views import ClinicDetailView, DashboardSummaryView
from apps.tenancy.views_settings import (
    ClinicHolidayViewSet,
    ClinicServiceViewSet,
    ClinicSettingsViewSet,
    WorkingHoursViewSet,
)
from apps.tenancy.views_team import ClinicMemberViewSet
from apps.visits.views_staff import VisitViewSet
from specialties.base.catalog import EXTENDED_SPECIALTIES
from specialties.clinical.views import make_record_viewset
from specialties.dental.views import DentalTreatmentViewSet
from specialties.dermatology.views import SkinCaseViewSet
from specialties.general.views import CarePlanViewSet
from specialties.obgyn.views import PregnancyViewSet, PregnancyVisitViewSet
from specialties.pediatrics.views import GrowthRecordViewSet, ImmunizationViewSet

router = DefaultRouter()
router.register("patients", PatientViewSet, basename="staff-patients")
router.register("appointments", AppointmentViewSet, basename="staff-appointments")
router.register("visits", VisitViewSet, basename="staff-visits")
router.register("prescriptions", PrescriptionViewSet, basename="staff-prescriptions")
router.register("files", FileAssetViewSet, basename="staff-files")
router.register("followup-plans", FollowUpPlanViewSet, basename="staff-followup-plans")
router.register("followup-items", FollowUpItemViewSet, basename="staff-followup-items")
router.register("invoices", InvoiceViewSet, basename="staff-invoices")
router.register("payments", PaymentViewSet, basename="staff-payments")
router.register("settings", ClinicSettingsViewSet, basename="staff-settings")
router.register("working-hours", WorkingHoursViewSet, basename="staff-working-hours")
router.register("holidays", ClinicHolidayViewSet, basename="staff-holidays")
router.register("services", ClinicServiceViewSet, basename="staff-services")
router.register("notifications", NotificationViewSet, basename="staff-notifications")
router.register("team", ClinicMemberViewSet, basename="staff-team")
router.register("roles", RoleViewSet, basename="staff-roles")
router.register("audit-logs", AuditLogViewSet, basename="staff-audit-logs")
router.register("obgyn/pregnancies", PregnancyViewSet, basename="staff-pregnancies")
router.register("obgyn/pregnancy-visits", PregnancyVisitViewSet, basename="staff-pregnancy-visits")
router.register("pediatrics/growth-records", GrowthRecordViewSet, basename="staff-pediatrics-growth")
router.register("pediatrics/immunizations", ImmunizationViewSet, basename="staff-pediatrics-immunization")
router.register("dental/treatments", DentalTreatmentViewSet, basename="staff-dental-treatment")
router.register("dermatology/cases", SkinCaseViewSet, basename="staff-dermatology-case")
router.register("general/care-plans", CarePlanViewSet, basename="staff-general-care-plan")

for _code in EXTENDED_SPECIALTIES:
    router.register(
        f"{_code}/records",
        make_record_viewset(_code),
        basename=f"staff-{_code}-records",
    )

urlpatterns = [
    path("dashboard/", DashboardSummaryView.as_view(), name="staff-dashboard"),
    path("clinic/", ClinicDetailView.as_view(), name="staff-clinic-detail"),
    path("subscription/", ClinicSubscriptionView.as_view(), name="staff-subscription"),
    path("permissions/", PermissionListView.as_view(), name="staff-permissions"),
    path("my-permissions/", MyPermissionsView.as_view(), name="staff-my-permissions"),
    path("", include(router.urls)),
]
