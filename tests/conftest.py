from datetime import time

import pytest
from django.core.management import call_command
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.core.constants import UserType
from apps.rbac.models import Role
from apps.tenancy.models import Clinic, ClinicMembership, ClinicSettings, WorkingHours


@pytest.fixture(autouse=True)
def seed_platform(db):
    """Seed the real platform permissions, roles, and plans so tests match production."""
    call_command("seed_platform")


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        username="dr_sara",
        password="testpass123",
        first_name="Sara",
        last_name="Ali",
        user_type=UserType.STAFF,
    )


@pytest.fixture
def clinic(db, staff_user):
    clinic = Clinic.objects.create(name="Dr Sara Clinic", slug="dr-sara", specialty_code="obgyn")
    ClinicSettings.objects.create(clinic=clinic)
    WorkingHours.objects.create(
        clinic=clinic, day_of_week=0, start_time=time(9, 0), end_time=time(17, 0)
    )
    membership = ClinicMembership.objects.create(
        clinic=clinic, user=staff_user, is_owner=True, is_active=True
    )
    membership.roles.add(Role.objects.get(slug="owner", clinic=None))
    return clinic


@pytest.fixture
def authed_staff_client(api_client, staff_user, clinic):
    from apps.accounts.tokens import get_tokens_for_user

    tokens = get_tokens_for_user(staff_user, clinic_id=clinic.id)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api_client
