import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.tenancy.models import Clinic, DoctorProfile


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestSpecialtyCatalog:
    def test_catalog_lists_assignable(self, api_client):
        response = api_client.get(reverse("specialty-catalog"))
        assert response.status_code == 200
        codes = [s["code"] for s in response.data["specialties"]]
        assert "obgyn" in codes
        assert "general" in codes
        assert "pediatrics" in codes
        assert "dental" in codes
        assert "dermatology" in codes
        assert "cardiology" in codes
        assert len(codes) >= 17

    def test_create_cardiology_clinic(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user

        tokens = get_tokens_for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            reverse("auth-create-clinic"),
            {"name": "Heart Clinic", "specialty_code": "cardiology", "slug": "heart-cl"},
        )
        assert response.status_code == 201
        assert response.data["clinic"]["specialty_code"] == "cardiology"

    def test_catalog_item_shape(self, api_client):
        response = api_client.get(reverse("specialty-catalog"))
        obgyn = next(s for s in response.data["specialties"] if s["code"] == "obgyn")
        assert obgyn["enabled"] is True
        assert obgyn["name_ar"]


@pytest.mark.django_db
class TestClinicSpecialtyAssignment:
    def test_create_clinic_with_specialty_code(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user

        tokens = get_tokens_for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            reverse("auth-create-clinic"),
            {"name": "OBGYN Clinic", "specialty_code": "obgyn", "slug": "obgyn-test"},
        )
        assert response.status_code == 201
        assert response.data["clinic"]["specialty_code"] == "obgyn"
        clinic = Clinic.objects.get(slug="obgyn-test")
        assert clinic.specialty_code == "obgyn"
        doctor = DoctorProfile.objects.get(clinic=clinic, user=staff_user)
        assert doctor.specialty

    def test_create_clinic_with_pediatrics(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user

        tokens = get_tokens_for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            reverse("auth-create-clinic"),
            {"name": "Ped Clinic", "specialty_code": "pediatrics", "slug": "ped-test"},
        )
        assert response.status_code == 201
        assert response.data["clinic"]["specialty_code"] == "pediatrics"

    def test_reject_unknown_specialty(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user

        tokens = get_tokens_for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            reverse("auth-create-clinic"),
            {"name": "Bad Clinic", "specialty_code": "oncology", "slug": "onco-test"},
        )
        assert response.status_code == 400

    def test_legacy_specialty_string_resolves(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user

        tokens = get_tokens_for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            reverse("auth-create-clinic"),
            {"name": "Legacy Clinic", "specialty": "Obstetrics & Gynecology", "slug": "legacy-obgyn"},
        )
        assert response.status_code == 201
        clinic = Clinic.objects.get(slug="legacy-obgyn")
        assert clinic.specialty_code == "obgyn"

    def test_clinic_detail_includes_branding(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user
        from apps.tenancy.models import ClinicMembership, ClinicSettings

        clinic = Clinic.objects.create(name="Brand Clinic", slug="brand-cl", specialty_code="dental")
        ClinicSettings.objects.create(clinic=clinic)
        ClinicMembership.objects.create(clinic=clinic, user=staff_user, is_owner=True, is_active=True)
        DoctorProfile.objects.create(clinic=clinic, user=staff_user, specialty="طب الأسنان")
        tokens = get_tokens_for_user(staff_user, clinic_id=clinic.id)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.get(reverse("staff-clinic-detail"))
        assert response.status_code == 200
        assert response.data["specialty_code"] == "dental"
        assert "branding" in response.data
        assert response.data["branding"]["primary"]
        assert "specialty_pack" in response.data

    def test_create_clinic_seeds_specialty_services(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user
        from apps.tenancy.models import ClinicService

        tokens = get_tokens_for_user(staff_user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.post(
            reverse("auth-create-clinic"),
            {"name": "Dental Pro", "specialty_code": "dental", "slug": "dental-pro"},
        )
        assert response.status_code == 201
        clinic = Clinic.objects.get(slug="dental-pro")
        assert ClinicService.objects.filter(clinic=clinic).count() >= 3

    def test_dashboard_specialty_metrics(self, api_client, staff_user):
        from apps.accounts.tokens import get_tokens_for_user
        from apps.tenancy.models import ClinicMembership, ClinicSettings

        clinic = Clinic.objects.create(name="Metrics Clinic", slug="metrics-cl", specialty_code="obgyn")
        ClinicSettings.objects.create(clinic=clinic)
        ClinicMembership.objects.create(clinic=clinic, user=staff_user, is_owner=True, is_active=True)
        tokens = get_tokens_for_user(staff_user, clinic_id=clinic.id)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.get(reverse("staff-dashboard"))
        assert response.status_code == 200
        assert "specialty_metrics" in response.data
        assert "specialty_branding" in response.data
        assert "visit_templates" in response.data


@pytest.mark.django_db
class TestChangeClinicSpecialty:
    def test_staff_cannot_change_specialty_via_api(self, authed_staff_client, clinic):
        response = authed_staff_client.patch(
            reverse("staff-clinic-detail"),
            {"specialty_code": "dental"},
            format="json",
        )
        assert response.status_code == 405
        clinic.refresh_from_db()
        assert clinic.specialty_code == "obgyn"

    def test_admin_change_updates_clinic_and_services(self, clinic, staff_user):
        from apps.audit.models import AuditLog
        from apps.tenancy.models import ClinicService
        from apps.tenancy.services_specialty import change_clinic_specialty

        DoctorProfile.objects.create(clinic=clinic, user=staff_user, specialty="النساء والتوليد")
        change_clinic_specialty(clinic, "dental", actor=staff_user)
        clinic.refresh_from_db()
        assert clinic.specialty_code == "dental"
        assert ClinicService.objects.filter(clinic=clinic).count() >= 3
        assert DoctorProfile.objects.get(clinic=clinic, user=staff_user).specialty
        assert AuditLog.objects.filter(clinic=clinic, action="clinic.specialty_changed").exists()

    def test_admin_form_exposes_specialty_choices(self):
        from apps.tenancy.admin import ClinicAdminForm

        form = ClinicAdminForm()
        codes = [value for value, _label in form.fields["specialty_code"].choices]
        assert "obgyn" in codes
        assert "dental" in codes
        assert "cardiology" in codes


@pytest.mark.django_db
class TestPublicAvailableDates:
    def test_available_dates(self, api_client, clinic):
        from datetime import time

        from apps.tenancy.models import WorkingHours

        WorkingHours.objects.get_or_create(
            clinic=clinic, day_of_week=0, doctor=None,
            defaults={"start_time": time(9, 0), "end_time": time(17, 0), "is_active": True},
        )
        response = api_client.get(reverse("public-available-dates", kwargs={"slug": clinic.slug}))
        assert response.status_code == 200
        assert "dates" in response.data
        assert "working_days" in response.data
