from django.core.management.base import BaseCommand

from apps.rbac.models import Permission, Role
from apps.subscriptions.models import SubscriptionPlan
from specialties.base.catalog import EXTENDED_SPECIALTIES, clinical_permissions

BASE_PERMISSIONS = [
    ("patients.view", "View Patients", "patients"),
    ("patients.create", "Create Patients", "patients"),
    ("patients.edit", "Edit Patients", "patients"),
    ("appointments.view", "View Appointments", "appointments"),
    ("appointments.create", "Manage Appointments", "appointments"),
    ("medical_records.view", "View Medical Records", "records"),
    ("medical_records.create", "Create Medical Records", "records"),
    ("prescriptions.create", "Create Prescriptions", "prescriptions"),
    ("billing.view", "View Billing", "billing"),
    ("billing.manage", "Manage Billing", "billing"),
    ("staff.manage", "Manage Staff", "staff"),
    ("settings.manage", "Manage Settings", "settings"),
    ("subscription.manage", "Manage Subscription", "subscriptions"),
    ("obgyn.pregnancy.view", "View Pregnancies", "obgyn"),
    ("obgyn.pregnancy.create", "Create Pregnancies", "obgyn"),
    ("obgyn.pregnancy.edit", "Edit Pregnancies", "obgyn"),
    ("pediatrics.growth.view", "View Growth Records", "pediatrics"),
    ("pediatrics.growth.edit", "Manage Growth Records", "pediatrics"),
    ("dental.treatment.view", "View Dental Treatments", "dental"),
    ("dental.treatment.edit", "Manage Dental Treatments", "dental"),
    ("dermatology.case.view", "View Skin Cases", "dermatology"),
    ("dermatology.case.edit", "Manage Skin Cases", "dermatology"),
    ("general.care.view", "View Care Plans", "general"),
    ("general.care.edit", "Manage Care Plans", "general"),
]


def build_permissions():
    perms = list(BASE_PERMISSIONS)
    for code, meta in EXTENDED_SPECIALTIES.items():
        view, edit = clinical_permissions(code)
        label = meta["name_ar"]
        perms.append((view, f"View {label} Records", code))
        perms.append((edit, f"Manage {label} Records", code))
    return perms


PERMISSIONS = build_permissions()
ROLES = {
    "owner": "Clinic Owner",
    "doctor": "Doctor",
    "manager": "Clinic Manager",
    "receptionist": "Receptionist",
    "nurse": "Nurse",
}

ROLE_PERMISSIONS = {
    "owner": [p[0] for p in PERMISSIONS],
    "doctor": [
        "patients.view", "patients.create", "patients.edit",
        "appointments.view", "appointments.create",
        "medical_records.view", "medical_records.create",
        "prescriptions.create", "billing.view", "settings.manage",
        "obgyn.pregnancy.view", "obgyn.pregnancy.create", "obgyn.pregnancy.edit",
        "pediatrics.growth.view", "pediatrics.growth.edit",
        "dental.treatment.view", "dental.treatment.edit",
        "dermatology.case.view", "dermatology.case.edit",
        "general.care.view", "general.care.edit",
    ] + [p for code in EXTENDED_SPECIALTIES for p in clinical_permissions(code)],
    "manager": [
        "patients.view", "patients.create", "patients.edit",
        "appointments.view", "appointments.create",
        "billing.view", "billing.manage", "staff.manage", "settings.manage",
    ],
    "receptionist": [
        "patients.view", "patients.create",
        "appointments.view", "appointments.create",
        "billing.view",
    ],
    "nurse": [
        "patients.view", "patients.edit",
        "appointments.view",
        "medical_records.view", "medical_records.create",
    ],
}

PLANS = [
    ("starter", "Starter", 0, 50, 3),
    ("professional", "Professional", 99, 500, 10),
    ("clinic", "Clinic", 299, None, None),
]


class Command(BaseCommand):
    help = "Seed platform permissions, roles, and subscription plans"

    def handle(self, *args, **options):
        perm_map = {}
        for codename, name, module in PERMISSIONS:
            perm, _ = Permission.objects.update_or_create(
                codename=codename,
                defaults={"name": name, "module": module},
            )
            perm_map[codename] = perm

        for slug, name in ROLES.items():
            role, _ = Role.objects.update_or_create(
                slug=slug,
                clinic=None,
                defaults={"name": name, "is_system": True},
            )
            role.permissions.set([perm_map[c] for c in ROLE_PERMISSIONS.get(slug, []) if c in perm_map])

        for slug, name, price, max_patients, max_staff in PLANS:
            SubscriptionPlan.objects.update_or_create(
                slug=slug,
                defaults={
                    "name": name,
                    "price_monthly": price,
                    "max_patients": max_patients,
                    "max_staff": max_staff,
                    "trial_days": 14,
                    "is_active": True,
                },
            )

        self.stdout.write(self.style.SUCCESS("Platform seeded successfully."))
