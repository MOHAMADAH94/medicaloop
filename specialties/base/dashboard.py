"""Specialty-aware dashboard metrics."""

from __future__ import annotations

from datetime import timedelta

from django.utils import timezone

from apps.tenancy.theme import clinic_branding
from specialties.base.pack import get_pack, pack_public_dict


def build_specialty_metrics(clinic) -> dict:
    code = clinic.specialty_code or "general"
    pack = get_pack(code)
    branding = clinic_branding(clinic)
    primary = branding["primary"]
    today = timezone.localdate()
    month_start = today.replace(day=1)
    metrics: list[dict] = []

    if code == "obgyn":
        from apps.core.constants import PregnancyStatus
        from specialties.obgyn.models import Pregnancy, UltrasoundRecord

        active = Pregnancy.objects.filter(clinic=clinic, status=PregnancyStatus.ACTIVE).count()
        high_risk = Pregnancy.objects.filter(
            clinic=clinic, status=PregnancyStatus.ACTIVE, risk_level__icontains="high"
        ).count()
        upcoming_edd = Pregnancy.objects.filter(
            clinic=clinic,
            status=PregnancyStatus.ACTIVE,
            edd_date__gte=today,
            edd_date__lte=today + timedelta(days=30),
        ).count()
        ultrasounds = UltrasoundRecord.objects.filter(
            clinic=clinic, date__gte=month_start
        ).count()
        metrics = [
            {"key": "active_pregnancies", "label_ar": "حالات حمل نشطة", "value": active, "color": primary},
            {"key": "high_risk", "label_ar": "حمل عالي الخطورة", "value": high_risk, "color": "#C62828"},
            {"key": "upcoming_edd", "label_ar": "ولادات متوقعة (30 يوم)", "value": upcoming_edd, "color": "#EC407A"},
            {"key": "ultrasounds_month", "label_ar": "سونار هذا الشهر", "value": ultrasounds, "color": "#7B1FA2"},
        ]
    elif code == "pediatrics":
        from specialties.pediatrics.models import GrowthRecord, Immunization

        growth = GrowthRecord.objects.filter(clinic=clinic).count()
        due = Immunization.objects.filter(
            clinic=clinic, status__in=["due", "overdue"]
        ).count()
        given_month = Immunization.objects.filter(
            clinic=clinic, status="given", given_date__gte=month_start
        ).count()
        metrics = [
            {"key": "growth_records", "label_ar": "سجلات نمو", "value": growth, "color": primary},
            {"key": "due_vaccines", "label_ar": "تطعيمات مستحقة", "value": due, "color": "#EF6C00"},
            {"key": "vaccines_month", "label_ar": "تطعيمات هذا الشهر", "value": given_month, "color": "#26A69A"},
        ]
    elif code == "dental":
        from specialties.dental.models import DentalTreatment

        planned = DentalTreatment.objects.filter(clinic=clinic, status="planned").count()
        in_progress = DentalTreatment.objects.filter(clinic=clinic, status="in_progress").count()
        completed = DentalTreatment.objects.filter(
            clinic=clinic, status="completed", treatment_date__gte=month_start
        ).count()
        metrics = [
            {"key": "planned_treatments", "label_ar": "علاجات مخططة", "value": planned, "color": primary},
            {"key": "in_progress", "label_ar": "قيد التنفيذ", "value": in_progress, "color": "#F9A825"},
            {"key": "completed_month", "label_ar": "مكتملة هذا الشهر", "value": completed, "color": "#2E7D32"},
        ]
    elif code == "dermatology":
        from specialties.dermatology.models import SkinCase

        active = SkinCase.objects.filter(clinic=clinic, status="active").count()
        severe = SkinCase.objects.filter(clinic=clinic, status="active", severity="severe").count()
        resolved = SkinCase.objects.filter(
            clinic=clinic, status="resolved", case_date__gte=month_start
        ).count()
        metrics = [
            {"key": "active_cases", "label_ar": "حالات نشطة", "value": active, "color": primary},
            {"key": "severe_cases", "label_ar": "حالات شديدة", "value": severe, "color": "#C62828"},
            {"key": "resolved_month", "label_ar": "تم الشفاء هذا الشهر", "value": resolved, "color": "#2E7D32"},
        ]
    elif code == "general":
        from specialties.general.models import CarePlan

        active = CarePlan.objects.filter(clinic=clinic, status="active").count()
        reviews = CarePlan.objects.filter(
            clinic=clinic,
            status="active",
            review_date__isnull=False,
            review_date__lte=today + timedelta(days=14),
        ).count()
        on_hold = CarePlan.objects.filter(clinic=clinic, status="on_hold").count()
        metrics = [
            {"key": "active_care_plans", "label_ar": "خطط رعاية نشطة", "value": active, "color": primary},
            {"key": "reviews_due", "label_ar": "مراجعات قريبة", "value": reviews, "color": "#EF6C00"},
            {"key": "on_hold", "label_ar": "خطط معلّقة", "value": on_hold, "color": "#757575"},
        ]
    else:
        from specialties.base.catalog import EXTENDED_SPECIALTIES
        from specialties.clinical.models import SpecialtyRecord

        if code in EXTENDED_SPECIALTIES:
            active = SpecialtyRecord.objects.filter(clinic=clinic, specialty_code=code, status="active").count()
            follow = SpecialtyRecord.objects.filter(clinic=clinic, specialty_code=code, status="follow_up").count()
            completed = SpecialtyRecord.objects.filter(
                clinic=clinic, specialty_code=code, status="completed", record_date__gte=month_start
            ).count()
            metrics = [
                {"key": "active_cases", "label_ar": "حالات نشطة", "value": active, "color": primary},
                {"key": "follow_up", "label_ar": "متابعة", "value": follow, "color": "#EF6C00"},
                {"key": "completed_month", "label_ar": "مكتملة هذا الشهر", "value": completed, "color": "#2E7D32"},
            ]
        else:
            from specialties.general.models import CarePlan

            active = CarePlan.objects.filter(clinic=clinic, status="active").count()
            metrics = [
                {"key": "active_cases", "label_ar": "سجلات نشطة", "value": active, "color": primary},
            ]

    return {
        "specialty_code": code,
        "branding": branding,
        "pack": pack_public_dict(code),
        "metrics": metrics,
        "visit_templates": pack.visit_templates,
        "clinical_modules": pack.clinical_modules,
    }
