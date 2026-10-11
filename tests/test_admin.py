import pytest
from django.urls import reverse

from apps.accounts.models import User
from apps.core.constants import UserType
from apps.rbac.models import Permission, Role
from apps.tenancy.models import Clinic, ClinicHoliday, ClinicMembership, ClinicService, WorkingHours


@pytest.fixture
def other_clinic(db):
    """A second clinic the test user is NOT a member of."""
    clinic = Clinic.objects.create(name="Rival Clinic", slug="rival", specialty_code="dental")
    ClinicService.objects.create(clinic=clinic, name="Rival Service", price=100)
    ClinicHoliday.objects.create(clinic=clinic, date="2030-01-01", reason="Rival holiday")
    WorkingHours.objects.create(
        clinic=clinic, day_of_week=2, start_time="08:00", end_time="12:00"
    )
    return clinic


@pytest.mark.django_db
class TestClinicIsolation:
    """Settings models are not TenantModel-backed, so scoping must be enforced by the mixin."""

    def test_services_exclude_other_clinics(self, authed_staff_client, clinic, other_clinic):
        response = authed_staff_client.get("/api/v1/staff/services/")
        assert response.status_code == 200
        names = [row["name"] for row in response.data["results"]]
        assert "Rival Service" not in names

    def test_holidays_exclude_other_clinics(self, authed_staff_client, clinic, other_clinic):
        response = authed_staff_client.get("/api/v1/staff/holidays/")
        assert response.status_code == 200
        reasons = [row["reason"] for row in response.data["results"]]
        assert "Rival holiday" not in reasons

    def test_working_hours_exclude_other_clinics(self, authed_staff_client, clinic, other_clinic):
        response = authed_staff_client.get("/api/v1/staff/working-hours/")
        assert response.status_code == 200
        ids = {row["id"] for row in response.data["results"]}
        rival_ids = {str(h.id) for h in other_clinic.working_hours.all()}
        assert ids.isdisjoint(rival_ids)

    def test_cannot_fetch_other_clinic_service_by_id(self, authed_staff_client, clinic, other_clinic):
        rival_service = other_clinic.services.first()
        response = authed_staff_client.get(f"/api/v1/staff/services/{rival_service.id}/")
        assert response.status_code == 404


@pytest.mark.django_db
class TestTeamManagement:
    def test_owner_sees_team_roster(self, authed_staff_client, clinic):
        response = authed_staff_client.get(reverse("staff-team-list"))
        assert response.status_code == 200
        assert response.data["count"] == 1
        assert response.data["results"][0]["is_owner"] is True

    def test_invite_creates_staff_account_and_membership(self, authed_staff_client, clinic):
        nurse_role = Role.objects.get(slug="owner")
        response = authed_staff_client.post(
            reverse("staff-team-invite"),
            {
                "username": "nurse_lina",
                "password": "strongpass123",
                "first_name": "Lina",
                "last_name": "Hassan",
                "job_title": "Head Nurse",
                "role_ids": [str(nurse_role.id)],
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.data["username"] == "nurse_lina"
        assert response.data["job_title"] == "Head Nurse"

        user = User.objects.get(username="nurse_lina")
        assert user.user_type == UserType.STAFF
        assert ClinicMembership.objects.filter(clinic=clinic, user=user, is_active=True).exists()

    def test_invite_rejects_new_account_without_password(self, authed_staff_client, clinic):
        response = authed_staff_client.post(
            reverse("staff-team-invite"),
            {"username": "ghost_user"},
            format="json",
        )
        assert response.status_code == 400

    def test_invite_rejects_patient_account(self, authed_staff_client, clinic):
        User.objects.create_user(
            username="patient_sami", password="pass12345", user_type=UserType.PATIENT
        )
        response = authed_staff_client.post(
            reverse("staff-team-invite"),
            {"username": "patient_sami"},
            format="json",
        )
        assert response.status_code == 400

    def test_owner_membership_cannot_be_removed(self, authed_staff_client, clinic, staff_user):
        membership = ClinicMembership.objects.get(clinic=clinic, user=staff_user)
        response = authed_staff_client.delete(
            reverse("staff-team-detail", kwargs={"pk": membership.id})
        )
        assert response.status_code == 403
        membership.refresh_from_db()
        assert membership.is_active is True

    def test_deactivating_member_is_soft(self, authed_staff_client, clinic):
        member_user = User.objects.create_user(
            username="recep_dana", password="pass12345", user_type=UserType.STAFF
        )
        membership = ClinicMembership.objects.create(clinic=clinic, user=member_user, is_active=True)

        response = authed_staff_client.delete(
            reverse("staff-team-detail", kwargs={"pk": membership.id})
        )
        assert response.status_code == 204

        membership.refresh_from_db()
        assert membership.is_active is False
        assert User.objects.filter(username="recep_dana").exists()

    def test_member_without_staff_manage_is_denied(self, api_client, clinic):
        plain_user = User.objects.create_user(
            username="plain_staff", password="pass12345", user_type=UserType.STAFF
        )
        ClinicMembership.objects.create(clinic=clinic, user=plain_user, is_active=True)

        from apps.accounts.tokens import get_tokens_for_user

        tokens = get_tokens_for_user(plain_user, clinic_id=clinic.id)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        assert api_client.get(reverse("staff-team-list")).status_code == 403


@pytest.mark.django_db
class TestRoles:
    def test_system_roles_are_listed(self, authed_staff_client, clinic):
        response = authed_staff_client.get(reverse("staff-roles-list"))
        assert response.status_code == 200
        slugs = {row["slug"] for row in response.data}
        assert "owner" in slugs

    def test_create_custom_clinic_role(self, authed_staff_client, clinic):
        Permission.objects.get_or_create(codename="patients.view", defaults={"name": "View"})
        response = authed_staff_client.post(
            reverse("staff-roles-list"),
            {
                "name": "Lab Technician",
                "slug": "lab-tech",
                "permission_codenames": ["patients.view"],
            },
            format="json",
        )
        assert response.status_code == 201
        role = Role.objects.get(slug="lab-tech", clinic=clinic)
        assert role.is_system is False
        assert list(role.permissions.values_list("codename", flat=True)) == ["patients.view"]

    def test_system_role_cannot_be_edited(self, authed_staff_client, clinic):
        owner_role = Role.objects.get(slug="owner", clinic=None)
        response = authed_staff_client.patch(
            reverse("staff-roles-detail", kwargs={"pk": owner_role.id}),
            {"name": "Hijacked"},
            format="json",
        )
        assert response.status_code == 403

    def test_system_role_cannot_be_deleted(self, authed_staff_client, clinic):
        owner_role = Role.objects.get(slug="owner", clinic=None)
        response = authed_staff_client.delete(
            reverse("staff-roles-detail", kwargs={"pk": owner_role.id})
        )
        assert response.status_code == 403
        assert Role.objects.filter(slug="owner", clinic=None).exists()


@pytest.mark.django_db
class TestPermissionsEndpoints:
    def test_my_permissions_returns_owner_set(self, authed_staff_client, clinic):
        response = authed_staff_client.get(reverse("staff-my-permissions"))
        assert response.status_code == 200
        assert "patients.view" in response.data["permissions"]

    def test_permission_catalog(self, authed_staff_client, clinic):
        response = authed_staff_client.get(reverse("staff-permissions"))
        assert response.status_code == 200
        assert any(row["codename"] == "patients.view" for row in response.data)


@pytest.mark.django_db
class TestAuditLog:
    def test_actions_are_recorded_and_scoped(self, authed_staff_client, clinic):
        authed_staff_client.post(
            reverse("staff-team-invite"),
            {"username": "audit_probe", "password": "strongpass123"},
            format="json",
        )
        response = authed_staff_client.get(reverse("staff-audit-logs-list"))
        assert response.status_code == 200
        actions = [row["action"] for row in response.data["results"]]
        assert "staff.invited" in actions
