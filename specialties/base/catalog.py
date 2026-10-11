"""Central catalog of all platform specialties."""

from __future__ import annotations

# Dedicated apps with custom models/APIs
DEDICATED_SPECIALTIES: dict[str, dict] = {
    "obgyn": {
        "name": "Obstetrics & Gynecology",
        "name_ar": "النساء والتوليد",
        "permissions": ["obgyn.pregnancy.view", "obgyn.pregnancy.create", "obgyn.pregnancy.edit"],
        "api_url_module": "specialties.obgyn.urls",
    },
    "pediatrics": {
        "name": "Pediatrics",
        "name_ar": "طب الأطفال",
        "permissions": ["pediatrics.growth.view", "pediatrics.growth.edit"],
        "api_url_module": "specialties.pediatrics.urls",
    },
    "dental": {
        "name": "Dental",
        "name_ar": "طب الأسنان",
        "permissions": ["dental.treatment.view", "dental.treatment.edit"],
        "api_url_module": "specialties.dental.urls",
    },
    "dermatology": {
        "name": "Dermatology",
        "name_ar": "الجلدية",
        "permissions": ["dermatology.case.view", "dermatology.case.edit"],
        "api_url_module": "specialties.dermatology.urls",
    },
    "general": {
        "name": "General Practice",
        "name_ar": "طب عام",
        "permissions": ["general.care.view", "general.care.edit"],
        "api_url_module": "specialties.general.urls",
    },
}

# Extended specialties using unified clinical records API
EXTENDED_SPECIALTIES: dict[str, dict] = {
    "cardiology": {"name": "Cardiology", "name_ar": "أمراض القلب"},
    "ophthalmology": {"name": "Ophthalmology", "name_ar": "طب العيون"},
    "orthopedics": {"name": "Orthopedics", "name_ar": "العظام والمفاصل"},
    "ent": {"name": "ENT", "name_ar": "أنف وأذن وحنجرة"},
    "psychiatry": {"name": "Psychiatry", "name_ar": "الطب النفسي"},
    "gastroenterology": {"name": "Gastroenterology", "name_ar": "الجهاز الهضمي"},
    "neurology": {"name": "Neurology", "name_ar": "الأعصاب"},
    "pulmonology": {"name": "Pulmonology", "name_ar": "الصدرية"},
    "urology": {"name": "Urology", "name_ar": "المسالك البولية"},
    "endocrinology": {"name": "Endocrinology", "name_ar": "الغدد الصماء"},
    "nutrition": {"name": "Clinical Nutrition", "name_ar": "التغذية العلاجية"},
    "physiotherapy": {"name": "Physiotherapy", "name_ar": "العلاج الطبيعي"},
}


def clinical_permissions(code: str) -> list[str]:
    return [f"{code}.record.view", f"{code}.record.edit"]


def all_specialty_codes() -> list[str]:
    return list(DEDICATED_SPECIALTIES.keys()) + list(EXTENDED_SPECIALTIES.keys())


def specialty_field_choices() -> list[tuple[str, str]]:
    """Admin/model choices: Arabic label with stable code."""
    catalog = {**DEDICATED_SPECIALTIES, **EXTENDED_SPECIALTIES}
    return [(code, f"{meta['name_ar']} ({code})") for code, meta in catalog.items()]


def is_extended(code: str) -> bool:
    return code in EXTENDED_SPECIALTIES
