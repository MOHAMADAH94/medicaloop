import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.accounts.tokens import get_tokens_for_user
from apps.core.constants import UserType
from apps.rbac.models import Role
from apps.tenancy.models import Clinic, ClinicMembership, ClinicSettings
from specialties.base.pack import branding_dict


@pytest.mark.django_db
class TestClinicThemeColor:
    def test_patch_theme_color_updates_branding(self, authed_staff_client, clinic):
        response = authed_staff_client.patch(
            reverse("staff-settings-current"),
            {"theme_color": "#1565C0"},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["theme_color"] == "#1565C0"
        assert response.data["branding"]["primary"] == "#1565C0"
        assert response.data["branding"]["primary_dark"].startswith("#")

        clinic_res = authed_staff_client.get(reverse("staff-clinic-detail"))
        assert clinic_res.status_code == 200
        assert clinic_res.data["branding"]["primary"] == "#1565C0"

        dash = authed_staff_client.get(reverse("staff-dashboard"))
        assert dash.data["specialty_branding"]["primary"] == "#1565C0"

        public = APIClient().get(reverse("public-clinic-detail", kwargs={"slug": clinic.slug}))
        assert public.status_code == 200
        assert public.data["clinic"]["branding"]["primary"] == "#1565C0"

    def test_invalid_hex_rejected(self, authed_staff_client):
        response = authed_staff_client.patch(
            reverse("staff-settings-current"),
            {"theme_color": "blue"},
            format="json",
        )
        assert response.status_code == 400
        payload = response.data
        if "error" in payload and isinstance(payload["error"], dict):
            payload = payload["error"].get("detail", payload)
        assert "theme_color" in payload

    def test_empty_restores_specialty_default(self, authed_staff_client, clinic):
        authed_staff_client.patch(
            reverse("staff-settings-current"),
            {"theme_color": "#C62828"},
            format="json",
        )
        response = authed_staff_client.patch(
            reverse("staff-settings-current"),
            {"theme_color": ""},
            format="json",
        )
        assert response.status_code == 200
        assert response.data["theme_color"] == ""
        expected = branding_dict(clinic.specialty_code)["primary"]
        assert response.data["branding"]["primary"] == expected

        clinic_res = authed_staff_client.get(reverse("staff-clinic-detail"))
        assert clinic_res.data["branding"]["primary"] == expected

    def test_doctor_can_change_theme_color(self, api_client, clinic):
        doctor = User.objects.create_user(
            username="dr_theme",
            password="testpass123",
            first_name="Theme",
            last_name="Doc",
            user_type=UserType.STAFF,
        )
        membership = ClinicMembership.objects.create(
            clinic=clinic, user=doctor, is_owner=False, is_active=True
        )
        membership.roles.add(Role.objects.get(slug="doctor", clinic=None))
        tokens = get_tokens_for_user(doctor, clinic_id=clinic.id)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        response = api_client.patch(
            reverse("staff-settings-current"),
            {"theme_color": "#00838F"},
            format="json",
        )
        assert response.status_code == 200
        assert ClinicSettings.objects.get(clinic=clinic).theme_color == "#00838F"
