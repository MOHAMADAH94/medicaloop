import pytest
from django.urls import reverse

from apps.patients.models import PatientClinicLink
from apps.rbac.models import Permission, Role


@pytest.mark.django_db
class TestHealthCheck:
    def test_health(self, api_client):
        response = api_client.get(reverse("health-check"))
        assert response.status_code == 200


@pytest.mark.django_db
class TestAuth:
    def test_staff_registration(self, api_client):
        response = api_client.post(
            reverse("auth-register-staff"),
            {
                "username": "new_doctor",
                "password": "testpass123",
                "first_name": "New",
                "last_name": "Doctor",
            },
        )
        assert response.status_code == 201
        assert "tokens" in response.data

    def test_create_clinic(self, authed_staff_client, staff_user):
        response = authed_staff_client.post(
            reverse("auth-create-clinic"),
            {
                "name": "Test Clinic",
                "specialty_code": "obgyn",
                "slug": "test-clinic",
            },
        )
        assert response.status_code == 201
        assert response.data["clinic"]["slug"] == "test-clinic"
        assert response.data["clinic"]["specialty_code"] == "obgyn"


@pytest.mark.django_db
class TestTenantIsolation:
    def test_public_clinic(self, api_client, clinic):
        response = api_client.get(reverse("public-clinic-detail", kwargs={"slug": "dr-sara"}))
        assert response.status_code == 200
        assert response.data["clinic"]["name"] == "Dr Sara Clinic"
        assert response.data["clinic"]["specialty_code"] == "obgyn"

    def test_staff_dashboard(self, authed_staff_client, clinic):
        response = authed_staff_client.get(reverse("staff-dashboard"))
        assert response.status_code == 200
        assert "today_appointments" in response.data
        assert response.data["specialty_code"] == "obgyn"


@pytest.mark.django_db
class TestPatients:
    def test_create_patient(self, authed_staff_client, clinic):
        role = Role.objects.get(slug="owner")
        perm, _ = Permission.objects.get_or_create(codename="patients.create", defaults={"name": "Create"})
        role.permissions.add(perm)

        response = authed_staff_client.post(
            "/api/v1/staff/patients/",
            {
                "first_name": "Fatima",
                "last_name": "Ahmed",
                "phone": "0500000000",
            },
        )
        assert response.status_code == 201
        assert PatientClinicLink.objects.filter(clinic=clinic).count() == 1


@pytest.mark.django_db
class TestObgynModule:
    def test_obgyn_registered(self, api_client):
        from specialties.base.registry import SpecialtyRegistry

        module = SpecialtyRegistry.get("obgyn")
        assert module is not None
        assert module.code == "obgyn"
