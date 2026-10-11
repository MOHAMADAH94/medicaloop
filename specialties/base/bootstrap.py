"""Register all platform specialty modules."""

from specialties.base.catalog import (
    DEDICATED_SPECIALTIES,
    EXTENDED_SPECIALTIES,
    clinical_permissions,
)
from specialties.base.registry import SpecialtyModule, SpecialtyRegistry


def register_specialties() -> None:
    if SpecialtyRegistry.get("cardiology"):
        return

    for code, meta in DEDICATED_SPECIALTIES.items():
        SpecialtyRegistry.register(
            SpecialtyModule(
                code=code,
                name=meta["name"],
                name_ar=meta["name_ar"],
                permissions=meta["permissions"],
                api_url_module=meta.get("api_url_module", ""),
                enabled=True,
            )
        )

    for code, meta in EXTENDED_SPECIALTIES.items():
        SpecialtyRegistry.register(
            SpecialtyModule(
                code=code,
                name=meta["name"],
                name_ar=meta["name_ar"],
                permissions=clinical_permissions(code),
                api_url_module="specialties.clinical.urls",
                enabled=True,
            )
        )
