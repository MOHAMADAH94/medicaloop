"""Specialty resolution and catalog helpers."""

from specialties.base.registry import SpecialtyModule, SpecialtyRegistry


def ensure_specialties_registered() -> None:
    from specialties.base.bootstrap import register_specialties

    register_specialties()


def get_module(code: str) -> SpecialtyModule | None:
    ensure_specialties_registered()
    return SpecialtyRegistry.get(code)


def list_modules(*, enabled_only: bool = False, assignable_only: bool = False) -> list[SpecialtyModule]:
    ensure_specialties_registered()
    modules = SpecialtyRegistry.all()
    if enabled_only:
        modules = [m for m in modules if m.enabled]
    if assignable_only:
        modules = [m for m in modules if m.enabled]
    return modules


def resolve_code(value: str) -> str:
    """Map free-text or code to canonical specialty code."""
    ensure_specialties_registered()
    if not value:
        return "general"
    normalized = value.strip().lower().replace(" ", "_").replace("&", "")
    for module in SpecialtyRegistry.all():
        if module.code == normalized or module.code.replace("_", "") == normalized.replace("_", ""):
            return module.code
    s = value.lower()
    if any(k in s for k in ("obgyn", "gynecology", "obstetric", "نساء", "توليد")):
        return "obgyn"
    if "pediatric" in s or "أطفال" in s:
        return "pediatrics"
    if "dental" in s or "أسنان" in s:
        return "dental"
    if "dermat" in s or "جلد" in s:
        return "dermatology"
    if "cardio" in s or "قلب" in s:
        return "cardiology"
    if "ophthal" in s or "عيون" in s or "eye" in s:
        return "ophthalmology"
    if "ortho" in s or "عظام" in s:
        return "orthopedics"
    if "ent" in s or "أنف" in s or "حنجرة" in s:
        return "ent"
    if "psych" in s or "نفس" in s:
        return "psychiatry"
    if "gastro" in s or "هضم" in s:
        return "gastroenterology"
    if "neuro" in s or "أعصاب" in s or "اعصاب" in s:
        return "neurology"
    if "pulmon" in s or "صدر" in s:
        return "pulmonology"
    if "urol" in s or "مسالك" in s:
        return "urology"
    if "endocrin" in s or "غدد" in s:
        return "endocrinology"
    if "nutri" in s or "تغذ" in s:
        return "nutrition"
    if "physio" in s or "علاج طبيع" in s:
        return "physiotherapy"
    return "general"


def module_to_dict(module: SpecialtyModule, *, active_code: str | None = None) -> dict:
    return {
        "code": module.code,
        "name": module.name,
        "name_ar": module.name_ar,
        "enabled": module.enabled,
        "assignable": module.enabled,
        "active": active_code == module.code if active_code else False,
    }


def get_display_name(code: str, *, lang: str = "ar") -> str:
    module = get_module(code)
    if not module:
        return code
    return module.name_ar if lang.startswith("ar") and module.name_ar else module.name
