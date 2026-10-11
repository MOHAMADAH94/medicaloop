import pytest
from django.urls import reverse
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestHealthCheck:
    def test_health_endpoint_returns_ok(self, api_client):
        url = reverse("health-check")
        response = api_client.get(url)
        assert response.status_code == 200
        assert response.data["status"] == "ok"
        assert response.data["service"] == "medicaloop"


@pytest.mark.django_db
class TestPublicClinic:
    def test_public_clinic_not_found(self, api_client):
        url = reverse("public-clinic-detail", kwargs={"slug": "nonexistent"})
        response = api_client.get(url)
        assert response.status_code == 404


@pytest.mark.django_db
class TestObgynModule:
    def test_obgyn_module_registered(self, api_client):
        from specialties.base.registry import SpecialtyRegistry

        module = SpecialtyRegistry.get("obgyn")
        assert module is not None
        assert module.code == "obgyn"
