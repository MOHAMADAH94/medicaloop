"""
Specialty experience packs — defaults that make a new clinic feel purpose-built.

Inspired by specialty EHR platforms (OmniMD, MicroMD, Office Practicum, Open Dental, ModMed):
specialty-specific services, clinical workflows, KPIs, and branding tokens.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal


@dataclass(frozen=True)
class ServiceSeed:
    name: str
    description: str
    price: Decimal
    duration_minutes: int = 30


@dataclass(frozen=True)
class BrandingPack:
    primary: str
    primary_dark: str
    secondary: str
    accent: str
    surface: str
    gradient: str
    tagline_ar: str
    hero_ar: str


@dataclass(frozen=True)
class SpecialtyPack:
    code: str
    branding: BrandingPack
    services: list[ServiceSeed] = field(default_factory=list)
    visit_templates: list[str] = field(default_factory=list)
    dashboard_hints: list[str] = field(default_factory=list)
    clinical_modules: list[dict] = field(default_factory=list)


PACKS: dict[str, SpecialtyPack] = {
    "obgyn": SpecialtyPack(
        code="obgyn",
        branding=BrandingPack(
            primary="#9C27B0",
            primary_dark="#6A1B9A",
            secondary="#EC407A",
            accent="#F8BBD0",
            surface="#FDF6FB",
            gradient="linear-gradient(135deg, #9C27B0 0%, #EC407A 100%)",
            tagline_ar="رعاية متخصصة لصحة المرأة والحمل",
            hero_ar="عيادة نساء وتوليد بإدارة حمل ومتابعة توليدية كاملة",
        ),
        services=[
            ServiceSeed("استشارة نسائية", "فحص ومتابعة صحة المرأة", Decimal("200"), 30),
            ServiceSeed("متابعة حمل", "زيارة متابعة حمل روتينية", Decimal("250"), 30),
            ServiceSeed("سونار حمل", "تصوير بالموجات فوق الصوتية", Decimal("300"), 40),
            ServiceSeed("فحص ما قبل الولادة", "تقييم شامل قبل الولادة", Decimal("350"), 45),
            ServiceSeed("متابعة ما بعد الولادة", "فحص بعد الولادة", Decimal("220"), 30),
        ],
        visit_templates=[
            "زيارة حمل روتينية",
            "استشارة عقم",
            "فحص سنوي للمرأة",
            "متابعة ما بعد الولادة",
        ],
        dashboard_hints=["active_pregnancies", "high_risk", "upcoming_edd", "ultrasounds_month"],
        clinical_modules=[
            {"key": "pregnancies", "label_ar": "متابعة الحمل", "path": "/dashboard/obgyn"},
        ],
    ),
    "pediatrics": SpecialtyPack(
        code="pediatrics",
        branding=BrandingPack(
            primary="#0288D1",
            primary_dark="#01579B",
            secondary="#26A69A",
            accent="#B3E5FC",
            surface="#F3FAFD",
            gradient="linear-gradient(135deg, #0288D1 0%, #26A69A 100%)",
            tagline_ar="نمو وتطعيمات ورعاية الأطفال بثقة",
            hero_ar="عيادة أطفال مع مخططات نمو ومتابعة تطعيمات",
        ),
        services=[
            ServiceSeed("كشف أطفال", "استشارة طب أطفال عامة", Decimal("180"), 25),
            ServiceSeed("متابعة نمو", "قياس الوزن والطول ومحيط الرأس", Decimal("150"), 20),
            ServiceSeed("تطعيمات", "جرعة تطعيم حسب الجدول", Decimal("120"), 15),
            ServiceSeed("فحص صحة الطفل", "زيارة دورية حسب العمر", Decimal("200"), 30),
            ServiceSeed("استشارة رضاعة", "دعم ومتابعة الرضاعة", Decimal("160"), 30),
        ],
        visit_templates=[
            "زيارة نمو دورية",
            "تطعيم",
            "مرض حاد",
            "متابعة مزمنة",
        ],
        dashboard_hints=["growth_records", "due_vaccines", "well_child_this_week"],
        clinical_modules=[
            {"key": "growth", "label_ar": "سجل النمو", "path": "/dashboard/pediatrics"},
            {"key": "immunizations", "label_ar": "التطعيمات", "path": "/dashboard/pediatrics?tab=vaccines"},
        ],
    ),
    "dental": SpecialtyPack(
        code="dental",
        branding=BrandingPack(
            primary="#00838F",
            primary_dark="#004D40",
            secondary="#00ACC1",
            accent="#B2EBF2",
            surface="#F0FAFB",
            gradient="linear-gradient(135deg, #00838F 0%, #00ACC1 100%)",
            tagline_ar="خريطة أسنان وعلاجات وإجراءات دقيقة",
            hero_ar="عيادة أسنان مع مخطط أسنان ومتابعة خطط العلاج",
        ),
        services=[
            ServiceSeed("كشف أسنان", "فحص وتشخيص", Decimal("150"), 20),
            ServiceSeed("تنظيف وتبييض", "تنظيف لثة وتلميع", Decimal("250"), 45),
            ServiceSeed("حشو", "حشو سن", Decimal("300"), 40),
            ServiceSeed("خلع", "خلع سن", Decimal("350"), 30),
            ServiceSeed("تقويم استشارة", "تقييم تقويم أسنان", Decimal("200"), 30),
        ],
        visit_templates=[
            "فحص دوري",
            "علاج لبي",
            "ترميم",
            "جراحة فم بسيطة",
        ],
        dashboard_hints=["planned_treatments", "in_progress", "completed_month"],
        clinical_modules=[
            {"key": "treatments", "label_ar": "علاجات الأسنان", "path": "/dashboard/dental"},
        ],
    ),
    "dermatology": SpecialtyPack(
        code="dermatology",
        branding=BrandingPack(
            primary="#6A1B9A",
            primary_dark="#4A148C",
            secondary="#AB47BC",
            accent="#E1BEE7",
            surface="#FAF5FC",
            gradient="linear-gradient(135deg, #6A1B9A 0%, #AB47BC 100%)",
            tagline_ar="تشخيص جلدي ومتابعة الحالات بدقة",
            hero_ar="عيادة جلدية مع تتبع المناطق والشدة وخطط العلاج",
        ),
        services=[
            ServiceSeed("كشف جلدية", "استشارة جلدية عامة", Decimal("220"), 25),
            ServiceSeed("علاج حب الشباب", "متابعة وعلاج", Decimal("280"), 30),
            ServiceSeed("إزالة شامة / آفة", "إجراء بسيط", Decimal("400"), 40),
            ServiceSeed("ليزر تجميلي", "جلسة ليزر", Decimal("500"), 45),
            ServiceSeed("متابعة اكزيما", "متابعة حالة مزمنة", Decimal("200"), 25),
        ],
        visit_templates=[
            "فحص جلدي أولي",
            "متابعة علاج",
            "إجراء جلدي",
            "تقييم تجميلي",
        ],
        dashboard_hints=["active_cases", "severe_cases", "resolved_month"],
        clinical_modules=[
            {"key": "cases", "label_ar": "الحالات الجلدية", "path": "/dashboard/dermatology"},
        ],
    ),
    "general": SpecialtyPack(
        code="general",
        branding=BrandingPack(
            primary="#1565C0",
            primary_dark="#0D47A1",
            secondary="#00897B",
            accent="#BBDEFB",
            surface="#F5F7FA",
            gradient="linear-gradient(135deg, #1565C0 0%, #00897B 100%)",
            tagline_ar="رعاية أولية وخطط متابعة منظمة",
            hero_ar="عيادة طب عام مع خطط رعاية ومتابعة الأمراض المزمنة",
        ),
        services=[
            ServiceSeed("كشف عام", "استشارة طب عام", Decimal("150"), 20),
            ServiceSeed("متابعة مزمنة", "ضغط / سكري / دهون", Decimal("180"), 25),
            ServiceSeed("فحص دوري", "فحص صحي شامل", Decimal("300"), 40),
            ServiceSeed("شهادة طبية", "إصدار شهادة", Decimal("100"), 15),
            ServiceSeed("استشارة متابعة", "مراجعة نتائج وتحاليل", Decimal("120"), 20),
        ],
        visit_templates=[
            "كشف أولي",
            "متابعة مزمنة",
            "مرض حاد",
            "مراجعة نتائج",
        ],
        dashboard_hints=["active_care_plans", "reviews_due", "chronic_patients"],
        clinical_modules=[
            {"key": "care_plans", "label_ar": "خطط الرعاية", "path": "/dashboard/general-care"},
        ],
    ),
    "cardiology": SpecialtyPack(
        code="cardiology",
        branding=BrandingPack(
            primary="#C62828", primary_dark="#8E0000", secondary="#EF5350", accent="#FFCDD2",
            surface="#FFF5F5", gradient="linear-gradient(135deg, #C62828 0%, #EF5350 100%)",
            tagline_ar="متابعة القلب والأوعية الدموية بدقة",
            hero_ar="عيادة قلب مع تخطيط ECG ومتابعة الحالات",
        ),
        services=[
            ServiceSeed("كشف قلب", "فحص واستشارة قلبية", Decimal("250"), 30),
            ServiceSeed("تخطيط قلب ECG", "تسجيل كهربائية القلب", Decimal("180"), 20),
            ServiceSeed("إيكو قلب", "تصوير بالموجات فوق الصوتية", Decimal("400"), 45),
            ServiceSeed("متابعة ضغط", "متابعة hypertension", Decimal("150"), 25),
            ServiceSeed("متابعة ما بعد جلطة", "برنامج تأهيل قلبي", Decimal("300"), 40),
        ],
        visit_templates=["كشف أولي", "متابعة CHF", "مراجعة ECG", "تعديل دواء"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل القلب", "path": "/dashboard/cardiology"}],
    ),
    "ophthalmology": SpecialtyPack(
        code="ophthalmology",
        branding=BrandingPack(
            primary="#1565C0", primary_dark="#0D47A1", secondary="#42A5F5", accent="#BBDEFB",
            surface="#F0F7FF", gradient="linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)",
            tagline_ar="فحص العيون ووصف النظارات والعدسات",
            hero_ar="عيادة عيون مع قياس حدة البصر ومتابعة الحالات",
        ),
        services=[
            ServiceSeed("فحص نظر", "قياس حدة البصر", Decimal("150"), 20),
            ServiceSeed("فحص قاع العين", "فحص شبكية", Decimal("220"), 25),
            ServiceSeed("قياس ضغط العين", "للجلaucoma", Decimal("180"), 20),
            ServiceSeed("وصف نظارات", "تقييم ووصف", Decimal("120"), 15),
            ServiceSeed("متابعة عدسات", "عدسات لاصقة", Decimal("200"), 30),
        ],
        visit_templates=["فحص نظر دوري", "متابعة جلوكوما", "التهاب ملتحمة", "وصف نظارات"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل العيون", "path": "/dashboard/ophthalmology"}],
    ),
    "orthopedics": SpecialtyPack(
        code="orthopedics",
        branding=BrandingPack(
            primary="#5D4037", primary_dark="#3E2723", secondary="#8D6E63", accent="#D7CCC8",
            surface="#FAF8F6", gradient="linear-gradient(135deg, #5D4037 0%, #8D6E63 100%)",
            tagline_ar="إصابات العظام والمفاصل وإعادة التأهيل",
            hero_ar="عيادة عظام مع تتبع الإصابات وخطط العلاج",
        ),
        services=[
            ServiceSeed("كشف عظام", "استشارة عظام", Decimal("200"), 25),
            ServiceSeed("متابعة كسر", "متابعة بعد جبس", Decimal("180"), 20),
            ServiceSeed("حقنة مفصل", "حقن داخل مفصلية", Decimal("350"), 30),
            ServiceSeed("علاج طبيعي", "جلسة تأهيل", Decimal("150"), 45),
            ServiceSeed("أشعة مراجعة", "مراجعة نتائج", Decimal("120"), 15),
        ],
        visit_templates=["إصابة حادة", "متابعة كسر", "ألم مفصل", "مراجعة أشعة"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل العظام", "path": "/dashboard/orthopedics"}],
    ),
    "ent": SpecialtyPack(
        code="ent",
        branding=BrandingPack(
            primary="#00695C", primary_dark="#004D40", secondary="#26A69A", accent="#B2DFDB",
            surface="#F0FAF8", gradient="linear-gradient(135deg, #00695C 0%, #26A69A 100%)",
            tagline_ar="أنف وأذن وحنجرة — تشخيص وعلاج متخصص",
            hero_ar="عيادة ENT مع متابعة التهابات الأذن والحنجرة",
        ),
        services=[
            ServiceSeed("كشف ENT", "فحص شامل", Decimal("180"), 25),
            ServiceSeed("تنظيف أذن", "إزالة شمع", Decimal("100"), 15),
            ServiceSeed("منظار حنجري", "فحص بالمنظار", Decimal("300"), 30),
            ServiceSeed("متابعة حساسية", "التهاب جيوب", Decimal("200"), 25),
            ServiceSeed("تقييم سمع", "فحص سمع", Decimal("220"), 30),
        ],
        visit_templates=["التهاب أذن", "التهاب حلق", "حساسية أنف", "طنين أذن"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل ENT", "path": "/dashboard/ent"}],
    ),
    "psychiatry": SpecialtyPack(
        code="psychiatry",
        branding=BrandingPack(
            primary="#4527A0", primary_dark="#311B92", secondary="#7E57C2", accent="#D1C4E9",
            surface="#F8F5FC", gradient="linear-gradient(135deg, #4527A0 0%, #7E57C2 100%)",
            tagline_ar="صحة نفسية ومتابعة علاجية سرية",
            hero_ar="عيادة نفسية مع جلسات ومتابعة الأدوية",
        ),
        services=[
            ServiceSeed("جلسة استشارة", "استشارة نفسية", Decimal("300"), 45),
            ServiceSeed("متابعة دواء", "مراجعة علاج", Decimal("200"), 30),
            ServiceSeed("تقييم نفسي", "تقييم شامل", Decimal("400"), 60),
            ServiceSeed("علاج سلوكي", "CBT جلسة", Decimal("350"), 50),
            ServiceSeed("متابعة قلق/اكتئاب", "متابعة دورية", Decimal("250"), 40),
        ],
        visit_templates=["جلسة أولى", "متابعة دواء", "أزمة قلق", "مراجعة خطة علاج"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "السجل النفسي", "path": "/dashboard/psychiatry"}],
    ),
    "gastroenterology": SpecialtyPack(
        code="gastroenterology",
        branding=BrandingPack(
            primary="#EF6C00", primary_dark="#E65100", secondary="#FFB74D", accent="#FFE0B2",
            surface="#FFF8F0", gradient="linear-gradient(135deg, #EF6C00 0%, #FFB74D 100%)",
            tagline_ar="جهاز هضمي — منع reflux إلى متابعة IBD",
            hero_ar="عيادة جهاز هضمي مع متابعة endoscopy ونتائج",
        ),
        services=[
            ServiceSeed("كشف جهاز هضمي", "استشارة", Decimal("220"), 30),
            ServiceSeed("متابعة reflux", "حرقة / GERD", Decimal("180"), 25),
            ServiceSeed("تحضير منظار", "استشارة قبل منظار", Decimal("250"), 30),
            ServiceSeed("متابعة IBD", "Crohn / Colitis", Decimal("300"), 40),
            ServiceSeed("مراجعة تحاليل", "كبد / H.pylori", Decimal("150"), 20),
        ],
        visit_templates=["ألم بطن", "إمساك/إسهال", "حرقة", "متابعة منظار"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل الهضمي", "path": "/dashboard/gastroenterology"}],
    ),
    "neurology": SpecialtyPack(
        code="neurology",
        branding=BrandingPack(
            primary="#283593", primary_dark="#1A237E", secondary="#5C6BC0", accent="#C5CAE9",
            surface="#F3F4FB", gradient="linear-gradient(135deg, #283593 0%, #5C6BC0 100%)",
            tagline_ar="أعصاب — صداع، صرع، و neuropathy",
            hero_ar="عيادة أعصاب مع متابعة EEG و MRI",
        ),
        services=[
            ServiceSeed("كشف أعصاب", "استشارة", Decimal("280"), 35),
            ServiceSeed("متابعة صداع", "migraine", Decimal("200"), 30),
            ServiceSeed("متابعة صرع", "تعديل دواء", Decimal("220"), 30),
            ServiceSeed("مراجعة MRI", "نتائج تصوير", Decimal("180"), 25),
            ServiceSeed("تقييم neuropathy", "تنميل / ضعف", Decimal("250"), 40),
        ],
        visit_templates=["صداع مزمن", "دوخة", "تشنجات", "مراجعة MRI"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل الأعصاب", "path": "/dashboard/neurology"}],
    ),
    "pulmonology": SpecialtyPack(
        code="pulmonology",
        branding=BrandingPack(
            primary="#0277BD", primary_dark="#01579B", secondary="#4FC3F7", accent="#B3E5FC",
            surface="#F0FAFF", gradient="linear-gradient(135deg, #0277BD 0%, #4FC3F7 100%)",
            tagline_ar="صدرية — ربو، COPD، و sleep apnea",
            hero_ar="عيادة صدرية مع spirometry ومتابعة رئة",
        ),
        services=[
            ServiceSeed("كشف صدرية", "استشارة", Decimal("220"), 30),
            ServiceSeed("قياس رئة", "Spirometry", Decimal("200"), 25),
            ServiceSeed("متابعة ربو", "Asthma control", Decimal("180"), 25),
            ServiceSeed("متابعة COPD", "مراجعة دورية", Decimal("200"), 30),
            ServiceSeed("تقييم نوم", "Sleep apnea", Decimal("350"), 45),
        ],
        visit_templates=["ضيق تنفس", "سعال مزمن", "متابعة ربو", "مراجعة أشعة"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل الصدرية", "path": "/dashboard/pulmonology"}],
    ),
    "urology": SpecialtyPack(
        code="urology",
        branding=BrandingPack(
            primary="#006064", primary_dark="#004D40", secondary="#00838F", accent="#B2EBF2",
            surface="#F0FAFB", gradient="linear-gradient(135deg, #006064 0%, #00838F 100%)",
            tagline_ar="مسالك بولية — كلى، prostate، UTIs",
            hero_ar="عيادة مسالك مع متابعة PSA و UTIs",
        ),
        services=[
            ServiceSeed("كشف مسالك", "استشارة", Decimal("220"), 30),
            ServiceSeed("متابعة BPH", "تضخم prostate", Decimal("200"), 30),
            ServiceSeed("علاج UTI", "التهاب بولي", Decimal("150"), 20),
            ServiceSeed("متابعة حصوات", "كلى / مثانة", Decimal("250"), 30),
            ServiceSeed("مراجعة PSA", "تحليل", Decimal("180"), 20),
        ],
        visit_templates=["UTI", "ألم حوض", "متابعة PSA", "حصوات"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل المسالك", "path": "/dashboard/urology"}],
    ),
    "endocrinology": SpecialtyPack(
        code="endocrinology",
        branding=BrandingPack(
            primary="#AD1457", primary_dark="#880E4F", secondary="#EC407A", accent="#F8BBD0",
            surface="#FDF5F8", gradient="linear-gradient(135deg, #AD1457 0%, #EC407A 100%)",
            tagline_ar="غدد صماء — سكري، thyroid، hormones",
            hero_ar="عيادة غدد مع HbA1c و thyroid panels",
        ),
        services=[
            ServiceSeed("كشف غدد", "استشارة", Decimal("250"), 30),
            ServiceSeed("متابعة سكري", "Type 1/2", Decimal("200"), 30),
            ServiceSeed("متابعة thyroid", "TSH / T4", Decimal("180"), 25),
            ServiceSeed("سمنة / hormones", "تقييم hormonal", Decimal("280"), 40),
            ServiceSeed("مراجعة HbA1c", "نتائج", Decimal("150"), 20),
        ],
        visit_templates=["متابعة سكري", "thyroid", "سمنة", "مراجعة تحاليل"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "سجل الغدد", "path": "/dashboard/endocrinology"}],
    ),
    "nutrition": SpecialtyPack(
        code="nutrition",
        branding=BrandingPack(
            primary="#558B2F", primary_dark="#33691E", secondary="#8BC34A", accent="#DCEDC8",
            surface="#F7FBF3", gradient="linear-gradient(135deg, #558B2F 0%, #8BC34A 100%)",
            tagline_ar="تغذية علاجية وخطط غذائية مخصصة",
            hero_ar="عيادة تغذية مع BMI و meal plans",
        ),
        services=[
            ServiceSeed("استشارة تغذية", "تقييم أولي", Decimal("180"), 40),
            ServiceSeed("خطة غذائية", "meal plan", Decimal("220"), 45),
            ServiceSeed("متابعة سمنة", "weight loss", Decimal("200"), 30),
            ServiceSeed("تغذية رياضية", "athletes", Decimal("250"), 40),
            ServiceSeed("متابعة سكري", "carb counting", Decimal("200"), 35),
        ],
        visit_templates=["تقييم أولي", "متابعة وزن", "خطة غذائية", "مراجعة تحاليل"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "خطط التغذية", "path": "/dashboard/nutrition"}],
    ),
    "physiotherapy": SpecialtyPack(
        code="physiotherapy",
        branding=BrandingPack(
            primary="#00897B", primary_dark="#00695C", secondary="#4DB6AC", accent="#B2DFDB",
            surface="#F0FAF9", gradient="linear-gradient(135deg, #00897B 0%, #4DB6AC 100%)",
            tagline_ar="علاج طبيعي وتأهيل حركي",
            hero_ar="عيادة علاج طبيعي مع برامج تمارين",
        ),
        services=[
            ServiceSeed("جلسة علاج طبيعي", "45 دقيقة", Decimal("150"), 45),
            ServiceSeed("تقييم حركي", "assessment", Decimal("200"), 40),
            ServiceSeed("تأهيل ما بعد جراحة", "post-op", Decimal("180"), 45),
            ServiceSeed("علاج ظهر", "back pain", Decimal("160"), 45),
            ServiceSeed("تأهيل رياضي", "sports rehab", Decimal("200"), 50),
        ],
        visit_templates=["تقييم أولي", "جلسة علاج", "متابعة تأهيل", "برنامج منزلي"],
        dashboard_hints=["active_cases", "follow_up", "completed_month"],
        clinical_modules=[{"key": "records", "label_ar": "برامج العلاج", "path": "/dashboard/physiotherapy"}],
    ),
}


def get_pack(code: str) -> SpecialtyPack:
    return PACKS.get(code) or PACKS["general"]


def branding_dict(code: str) -> dict:
    b = get_pack(code).branding
    return {
        "primary": b.primary,
        "primary_dark": b.primary_dark,
        "secondary": b.secondary,
        "accent": b.accent,
        "surface": b.surface,
        "gradient": b.gradient,
        "tagline_ar": b.tagline_ar,
        "hero_ar": b.hero_ar,
    }


def seed_clinic_services(clinic) -> int:
    """Create default public services for a clinic from its specialty pack."""
    from apps.tenancy.models import ClinicService

    pack = get_pack(clinic.specialty_code)
    created = 0
    for svc in pack.services:
        _, was_created = ClinicService.objects.get_or_create(
            clinic=clinic,
            name=svc.name,
            defaults={
                "description": svc.description,
                "price": svc.price,
                "duration_minutes": svc.duration_minutes,
                "is_public": True,
                "is_active": True,
            },
        )
        if was_created:
            created += 1
    return created


def pack_public_dict(code: str) -> dict:
    pack = get_pack(code)
    return {
        "code": pack.code,
        "branding": branding_dict(code),
        "visit_templates": pack.visit_templates,
        "clinical_modules": pack.clinical_modules,
        "dashboard_hints": pack.dashboard_hints,
    }
