"""Change a clinic's specialty and apply branding/service side effects."""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from apps.audit.services import log_action
from apps.tenancy.models import DoctorProfile
from specialties.base.pack import seed_clinic_services
from specialties.base.services import get_display_name, get_module


def resolve_assignable_module(specialty_code: str):
    raw = (specialty_code or "").strip().lower().replace(" ", "_").replace("&", "")
    module = get_module(raw)
    if not module:
        raise ValidationError({"specialty_code": "Unknown specialty."})
    if not module.enabled:
        raise ValidationError({"specialty_code": "This specialty is not available yet."})
    return module


def apply_specialty_side_effects(clinic, *, previous_code: str | None = None, actor=None, request=None):
    """Seed specialty services and refresh doctor labels after specialty_code is saved."""
    label = get_display_name(clinic.specialty_code, lang="ar")
    DoctorProfile.objects.filter(clinic=clinic).update(specialty=label)
    seed_clinic_services(clinic)
    if actor and previous_code and previous_code != clinic.specialty_code:
        ip = None
        if request is not None:
            ip = request.META.get("REMOTE_ADDR")
        log_action(
            clinic=clinic,
            actor=actor,
            action="clinic.specialty_changed",
            resource_type="Clinic",
            resource_id=clinic.id,
            ip_address=ip,
            metadata={"from": previous_code, "to": clinic.specialty_code},
        )


@transaction.atomic
def change_clinic_specialty(clinic, specialty_code, *, actor=None, request=None):
    module = resolve_assignable_module(specialty_code)
    previous = clinic.specialty_code
    if previous == module.code:
        return clinic, False

    clinic.specialty_code = module.code
    clinic.save(update_fields=["specialty_code", "updated_at"])
    apply_specialty_side_effects(
        clinic,
        previous_code=previous,
        actor=actor,
        request=request,
    )
    return clinic, True
