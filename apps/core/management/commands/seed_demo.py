"""
Seed comprehensive demo data for local development and UI testing.

Usage:
    python manage.py seed_platform   # roles & plans (required once)
    python manage.py seed_demo       # full demo dataset
    python manage.py seed_demo --reset   # wipe demo clinic data and re-seed
"""

from datetime import date, datetime, time, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.billing.models import Invoice, InvoiceLine, Payment
from apps.core.constants import (
    AppointmentStatus,
    FollowUpStatus,
    InvoiceStatus,
    NotificationType,
    PaymentStatus,
    PregnancyStatus,
    Visibility,
    VisitStatus,
)
from apps.files.models import FileAsset
from apps.followups.models import FollowUpItem, FollowUpPlan
from apps.notifications.models import Notification
from apps.patients.models import Patient, PatientClinicLink
from apps.prescriptions.models import Prescription, PrescriptionItem
from apps.rbac.models import Role
from apps.records.models import ClinicalNote, Diagnosis, LabRequest, VitalSign
from apps.subscriptions.models import ClinicSubscription, SubscriptionPlan
from apps.tenancy.models import (
    Clinic,
    ClinicHoliday,
    ClinicMembership,
    ClinicService,
    ClinicSettings,
    DoctorProfile,
    WorkingHours,
)
from apps.visits.models import Visit
from specialties.obgyn.models import Pregnancy, PregnancyVisit, RiskFactor, UltrasoundRecord
from specialties.obgyn.services.calculations import ObgynCalculationsService

User = get_user_model()

DEMO_PASSWORD = "Demo1234!"
CLINIC_SLUG = "dr-sara"

ACCOUNTS = {
    "doctor": {
        "username": "dr_sara",
        "email": "doctor@medicaloop.test",
        "first_name": "سارة",
        "last_name": "الراشد",
        "phone": "0500000001",
    },
    "patient": {"username": "fatima", "email": "", "first_name": "فاطمة", "last_name": "أحمد", "phone": "0551111111"},
    "patient2": {"username": "nour", "email": "", "first_name": "نور", "last_name": "محمد", "phone": "0552222222"},
}


class Command(BaseCommand):
    help = "Seed demo clinic with sample data for all platform features"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo clinic data before seeding",
        )

    def handle(self, *args, **options):
        call_command("seed_platform")
        if options["reset"]:
            self._reset_demo()
        with transaction.atomic():
            ctx = self._seed_all()
        self._print_summary(ctx)

    def _reset_demo(self):
        clinic = Clinic.objects.filter(slug=CLINIC_SLUG).first()
        if not clinic:
            return
        self.stdout.write("Resetting demo clinic data...")
        clinic.delete()

    def _seed_all(self):
        doctor_user = self._upsert_staff(**ACCOUNTS["doctor"])
        patient_user = self._upsert_patient_user(**ACCOUNTS["patient"])
        patient2_user = self._upsert_patient_user(**ACCOUNTS["patient2"])

        clinic = self._upsert_clinic()
        settings = self._upsert_clinic_settings(clinic)
        doctor_profile = self._upsert_doctor(clinic, doctor_user)
        self._upsert_membership(clinic, doctor_user)
        self._upsert_subscription(clinic)
        self._upsert_working_hours(clinic, doctor_profile)
        self._upsert_holidays(clinic)
        services = self._upsert_services(clinic)

        patients = self._upsert_patients(clinic, patient_user, patient2_user)
        main_patient = patients["fatima"]

        appts = self._upsert_appointments(clinic, doctor_profile, services, patients, doctor_user, patient_user)
        visits = self._upsert_visits(clinic, doctor_profile, appts)
        self._upsert_records(clinic, doctor_user, visits, main_patient)
        self._upsert_prescriptions(clinic, doctor_profile, visits, patients)
        self._upsert_followups(clinic, doctor_user, visits, patients)
        self._upsert_files(clinic, doctor_user, visits, main_patient)
        pregnancy = self._upsert_obgyn(clinic, main_patient, visits.get("completed"))
        self._upsert_billing(clinic, services, patients, appts)
        self._upsert_notifications(clinic, doctor_user, patient_user, appts)

        settings.onboarding_completed = True
        settings.save(update_fields=["onboarding_completed"])

        return {
            "clinic": clinic,
            "doctor_user": doctor_user,
            "patient_user": patient_user,
            "patient2_user": patient2_user,
            "patients": patients,
            "pregnancy": pregnancy,
        }

    def _upsert_staff(self, username, first_name, last_name, phone, email=""):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "phone": phone,
                "user_type": "staff",
                "is_active": True,
            },
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        else:
            user.first_name = first_name
            user.last_name = last_name
            user.phone = phone
            user.user_type = "staff"
            user.save(update_fields=["first_name", "last_name", "phone", "user_type"])
        return user

    def _upsert_patient_user(self, username, first_name, last_name, phone, email=""):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "phone": phone,
                "user_type": "patient",
                "is_active": True,
            },
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
        return user

    def _upsert_clinic(self):
        clinic, _ = Clinic.objects.update_or_create(
            slug=CLINIC_SLUG,
            defaults={
                "name": "عيادة د. سارة",
                "specialty_code": "obgyn",
                "description": (
                    "عيادة نساء وتوليد متخصصة في متابعة الحمل، الولادة، "
                    "والرعاية الصحية للمرأة. نقدم خدمات شاملة بأحدث المعايير الطبية."
                ),
                "phone": "0500000000",
                "email": "info@dr-sara.medicaloop.test",
                "address": "حي الملز، شارع الأمير سلطان",
                "city": "الرياض",
                "country": "SA",
                "is_active": True,
                "timezone": "Asia/Riyadh",
            },
        )
        return clinic

    def _upsert_clinic_settings(self, clinic):
        settings, _ = ClinicSettings.objects.update_or_create(
            clinic=clinic,
            defaults={
                "appointment_duration_minutes": 30,
                "max_daily_appointments": 20,
                "auto_confirm_appointments": False,
                "cancellation_hours_before": 24,
                "allow_patient_reschedule": True,
                "onboarding_completed": True,
            },
        )
        return settings

    def _upsert_doctor(self, clinic, user):
        profile, _ = DoctorProfile.objects.update_or_create(
            clinic=clinic,
            user=user,
            defaults={
                "specialty": "Obstetrics & Gynecology",
                "bio": "استشارية نساء وتوليد — متخصصة في متابعة الحمل عالي الخطورة والولادة الطبيعية.",
                "license_number": "SA-OB-12345",
                "is_public": True,
            },
        )
        return profile

    def _upsert_membership(self, clinic, user):
        membership, _ = ClinicMembership.objects.update_or_create(
            clinic=clinic,
            user=user,
            defaults={"is_owner": True, "is_active": True, "job_title": "استشارية"},
        )
        owner_role = Role.objects.filter(slug="owner", is_system=True, clinic__isnull=True).first()
        if owner_role:
            membership.roles.set([owner_role])
        return membership

    def _upsert_subscription(self, clinic):
        plan = SubscriptionPlan.objects.filter(slug="professional").first()
        if plan:
            ClinicSubscription.objects.update_or_create(
                clinic=clinic,
                defaults={"plan": plan, "status": "active"},
            )

    def _upsert_working_hours(self, clinic, doctor):
        WorkingHours.objects.filter(clinic=clinic).delete()
        for day in range(0, 5):  # Mon–Fri
            WorkingHours.objects.create(
                clinic=clinic,
                doctor=None,
                day_of_week=day,
                start_time=time(9, 0),
                end_time=time(17, 0),
                is_active=True,
            )

    def _upsert_holidays(self, clinic):
        holiday_date = self._next_weekday(4) + timedelta(days=7)  # next Friday + 1 week
        ClinicHoliday.objects.update_or_create(
            clinic=clinic,
            date=holiday_date,
            defaults={"reason": "إجازة العيد"},
        )

    def _upsert_services(self, clinic):
        from specialties.base.pack import seed_clinic_services

        seed_clinic_services(clinic)
        services = {s.name: s for s in ClinicService.objects.filter(clinic=clinic)}
        return services

    def _upsert_patients(self, clinic, patient_user, patient2_user):
        fatima, _ = Patient.objects.update_or_create(
            user=patient_user,
            defaults={
                "first_name": "فاطمة",
                "last_name": "أحمد",
                "email": patient_user.email,
                "phone": "0551111111",
                "date_of_birth": date(1992, 3, 15),
                "gender": "female",
                "allergies": "Penicillin",
                "chronic_conditions": "لا يوجد",
                "emergency_contact_name": "أحمد علي",
                "emergency_contact_phone": "0559999999",
            },
        )
        nour, _ = Patient.objects.update_or_create(
            email="nour.demo@medicaloop.test",
            defaults={
                "first_name": "نور",
                "last_name": "محمد",
                "phone": "0552222222",
                "date_of_birth": date(1988, 7, 20),
                "gender": "female",
                "user": patient2_user,
            },
        )
        maha, _ = Patient.objects.update_or_create(
            email="maha.demo@medicaloop.test",
            defaults={
                "first_name": "مها",
                "last_name": "العلي",
                "phone": "0553333333",
                "date_of_birth": date(1995, 11, 8),
                "gender": "female",
            },
        )
        for i, p in enumerate([fatima, nour, maha], start=1):
            PatientClinicLink.objects.update_or_create(
                clinic=clinic,
                patient=p,
                defaults={"medical_record_number": f"MR-{i:04d}", "is_active": True},
            )
        return {"fatima": fatima, "nour": nour, "maha": maha}

    def _upsert_appointments(self, clinic, doctor, services, patients, doctor_user, patient_user):
        tz = timezone.get_current_timezone()
        today = timezone.localdate()

        def mk_dt(d: date, hour: int, minute: int = 0):
            naive = datetime.combine(d, time(hour, minute))
            return timezone.make_aware(naive, tz)

        def next_workday(offset_days=1):
            d = today + timedelta(days=offset_days)
            while d.weekday() > 4:
                d += timedelta(days=1)
            return d

        pending_day = next_workday(2)
        confirmed_day = next_workday(3)
        completed_day = today - timedelta(days=7)
        while completed_day.weekday() > 4:
            completed_day -= timedelta(days=1)

        checkup = services.get("استشارة نسائية") or next(iter(services.values()))
        prenatal = services.get("متابعة حمل") or checkup

        specs = [
            ("pending", patients["fatima"], pending_day, 10, 0, AppointmentStatus.PENDING, prenatal),
            ("pending_nour", patients["nour"], pending_day, 11, 0, AppointmentStatus.PENDING, checkup),
            ("confirmed", patients["fatima"], confirmed_day, 14, 0, AppointmentStatus.CONFIRMED, prenatal),
            ("confirmed_maha", patients["maha"], confirmed_day, 15, 0, AppointmentStatus.CONFIRMED, checkup),
            ("completed", patients["fatima"], completed_day, 10, 0, AppointmentStatus.COMPLETED, prenatal),
        ]

        result = {}
        for key, patient, day, hour, minute, status, service in specs:
            start = mk_dt(day, hour, minute)
            end = start + timedelta(minutes=30)
            appt, _ = Appointment.objects.update_or_create(
                clinic=clinic,
                patient=patient,
                scheduled_start=start,
                defaults={
                    "doctor": doctor,
                    "service": service,
                    "scheduled_end": end,
                    "status": status,
                    "created_by": patient_user if status == AppointmentStatus.PENDING else doctor_user,
                    "notes": "موعد تجريبي",
                },
            )
            result[key] = appt
        return result

    def _upsert_visits(self, clinic, doctor, appts):
        completed_appt = appts.get("completed")
        if not completed_appt:
            return {}
        visit, _ = Visit.objects.update_or_create(
            clinic=clinic,
            appointment=completed_appt,
            defaults={
                "patient": completed_appt.patient,
                "doctor": doctor,
                "visit_date": completed_appt.scheduled_start,
                "status": VisitStatus.COMPLETED,
                "chief_complaint": "متابعة حمل — الشهر السادس",
                "symptoms": "غثيان خفيف، لا نزيف",
                "treatment": "مكملات حديد وفيتامين D",
                "patient_instructions": "الإكثار من السوائل والراحة",
                "patient_instructions_visible": True,
            },
        )
        return {"completed": visit}

    def _upsert_records(self, clinic, doctor_user, visits, patient):
        visit = visits.get("completed")
        if not visit:
            return
        VitalSign.objects.update_or_create(
            clinic=clinic,
            visit=visit,
            patient=patient,
            defaults={
                "blood_pressure_systolic": 118,
                "blood_pressure_diastolic": 76,
                "heart_rate": 82,
                "temperature": Decimal("36.8"),
                "weight": Decimal("68.5"),
                "height": Decimal("165.0"),
            },
        )
        Diagnosis.objects.update_or_create(
            clinic=clinic,
            visit=visit,
            patient=patient,
            description="حمل intrauterine single live — 24 weeks",
            defaults={
                "code": "Z34.0",
                "visibility": Visibility.PATIENT_VISIBLE,
                "patient_summary": "حمل طبيعي — الأسبوع 24",
            },
        )
        ClinicalNote.objects.update_or_create(
            clinic=clinic,
            visit=visit,
            patient=patient,
            defaults={
                "author": doctor_user,
                "content": "فحص سريري طبيعي. نبض الجنين منتظم. ينصح بمتابعة بعد 4 أسابيع.",
                "visibility": Visibility.PRIVATE,
            },
        )
        LabRequest.objects.update_or_create(
            clinic=clinic,
            visit=visit,
            patient=patient,
            test_name="Complete Blood Count",
            defaults={
                "instructions": "تحليل دم شامل + سكر صائم",
                "visibility": Visibility.PATIENT_VISIBLE,
            },
        )

    def _upsert_prescriptions(self, clinic, doctor, visits, patients):
        visit = visits.get("completed")
        if not visit:
            return
        rx, _ = Prescription.objects.update_or_create(
            clinic=clinic,
            visit=visit,
            patient=patients["fatima"],
            defaults={
                "doctor": doctor,
                "notes": "وصفة متابعة حمل",
                "visibility": Visibility.PATIENT_VISIBLE,
            },
        )
        items = [
            ("Folic Acid", "5mg", "مرة يومياً", "طوال فترة الحمل"),
            ("Iron Supplement", "200mg", "مرة يومياً", "3 أشهر"),
            ("Vitamin D3", "1000 IU", "مرة يومياً", "3 أشهر"),
        ]
        PrescriptionItem.objects.filter(prescription=rx).delete()
        for med, dosage, freq, duration in items:
            PrescriptionItem.objects.create(
                clinic=clinic,
                prescription=rx,
                medication_name=med,
                dosage=dosage,
                frequency=freq,
                duration=duration,
            )
        # وصفة ثانية لمريضة أخرى
        rx2, _ = Prescription.objects.get_or_create(
            clinic=clinic,
            patient=patients["nour"],
            notes="كشف دوري",
            defaults={"doctor": doctor, "visibility": Visibility.PATIENT_VISIBLE},
        )
        if not rx2.items.exists():
            PrescriptionItem.objects.create(
                clinic=clinic,
                prescription=rx2,
                medication_name="Paracetamol",
                dosage="500mg",
                frequency="عند الحاجة",
                duration="5 أيام",
            )

    def _upsert_followups(self, clinic, doctor_user, visits, patients):
        visit = visits.get("completed")
        plan, _ = FollowUpPlan.objects.update_or_create(
            clinic=clinic,
            patient=patients["fatima"],
            title="متابعة حمل — خطة شهرية",
            defaults={
                "visit": visit,
                "description": "زيارات متابعة حمل دورية",
                "is_active": True,
            },
        )
        overdue_date = timezone.localdate() - timedelta(days=3)
        upcoming_date = timezone.localdate() + timedelta(days=14)
        items_spec = [
            ("سونار الشهر السابع", overdue_date, FollowUpStatus.PENDING, True),
            ("تحليل سكر تراكمي", upcoming_date, FollowUpStatus.PENDING, True),
            ("زيارة متابعة", timezone.localdate() + timedelta(days=28), FollowUpStatus.IN_PROGRESS, True),
        ]
        FollowUpItem.objects.filter(plan=plan).delete()
        for title, due, status, visible in items_spec:
            FollowUpItem.objects.create(
                clinic=clinic,
                plan=plan,
                patient=patients["fatima"],
                title=title,
                due_date=due,
                status=status,
                patient_visible=visible,
                patient_instructions=f"يرجى إجراء {title} في الموعد المحدد",
            )

    def _upsert_files(self, clinic, doctor_user, visits, patient):
        visit = visits.get("completed")
        content = b"Demo ultrasound report - Medicaloop seed data"
        for name, category, visible in [
            ("تقرير_سونار_الحمل.pdf", "imaging", Visibility.PATIENT_VISIBLE),
            ("تحليل_دم_شامل.pdf", "lab", Visibility.PATIENT_VISIBLE),
            ("ملاحظات_طبية_داخلية.pdf", "report", Visibility.PRIVATE),
        ]:
            asset, created = FileAsset.objects.get_or_create(
                clinic=clinic,
                patient=patient,
                original_name=name,
                defaults={
                    "visit": visit,
                    "uploaded_by": doctor_user,
                    "category": category,
                    "mime_type": "application/pdf",
                    "size_bytes": len(content),
                    "visibility": visible,
                    "description": f"ملف تجريبي — {name}",
                },
            )
            if created or not asset.file:
                asset.file.save(name, ContentFile(content), save=True)

    def _upsert_obgyn(self, clinic, patient, visit):
        lmp = date.today() - timedelta(days=24 * 7 + 3)
        edd = ObgynCalculationsService.calculate_edd(lmp)
        pregnancy, _ = Pregnancy.objects.update_or_create(
            clinic=clinic,
            patient=patient,
            lmp_date=lmp,
            defaults={
                "edd_date": edd,
                "status": PregnancyStatus.ACTIVE,
                "risk_level": "medium",
                "notes": "حمل ثاني — تاريخ ولادة قيصرية سابقة",
                "patient_portal_enabled": True,
            },
        )
        RiskFactor.objects.filter(pregnancy=pregnancy).delete()
        RiskFactor.objects.create(
            clinic=clinic,
            pregnancy=pregnancy,
            patient=patient,
            name="ولادة قيصرية سابقة",
            severity="medium",
            notes="تتطلب متابعة وثيقة",
        )
        weeks, days = ObgynCalculationsService.calculate_gestational_age(lmp)
        PregnancyVisit.objects.update_or_create(
            clinic=clinic,
            pregnancy=pregnancy,
            visit_date=timezone.localdate() - timedelta(days=14),
            defaults={
                "patient": patient,
                "visit": visit,
                "gestational_age_weeks": max(weeks - 2, 1),
                "gestational_age_days": days,
                "weight": Decimal("67.0"),
                "blood_pressure": "118/76",
                "fundal_height": Decimal("24.0"),
                "fetal_heart_rate": 145,
                "notes": "نمو الجنين طبيعي",
                "visibility": Visibility.PATIENT_VISIBLE,
            },
        )
        UltrasoundRecord.objects.update_or_create(
            clinic=clinic,
            pregnancy=pregnancy,
            date=timezone.localdate() - timedelta(days=21),
            defaults={
                "patient": patient,
                "findings": "جنين واحد حي — نبض قلبي منتظم — موقع placenta anterior",
                "visibility": Visibility.PATIENT_VISIBLE,
            },
        )
        return pregnancy

    def _upsert_billing(self, clinic, services, patients, appts):
        inv, _ = Invoice.objects.update_or_create(
            clinic=clinic,
            invoice_number="INV-2026-001",
            defaults={
                "patient": patients["fatima"],
                "appointment": appts.get("completed"),
                "status": InvoiceStatus.PAID,
                "subtotal": Decimal("350.00"),
                "discount": Decimal("0"),
                "total": Decimal("350.00"),
                "notes": "فاتورة متابعة حمل",
                "issued_at": timezone.now() - timedelta(days=7),
            },
        )
        svc = services.get("متابعة حمل") or next(iter(services.values()))
        InvoiceLine.objects.update_or_create(
            clinic=clinic,
            invoice=inv,
            description="متابعة حمل",
            defaults={
                "service": svc,
                "quantity": 1,
                "unit_price": Decimal("350.00"),
                "total": Decimal("350.00"),
            },
        )
        Payment.objects.update_or_create(
            clinic=clinic,
            invoice=inv,
            reference="PAY-001",
            defaults={
                "patient": patients["fatima"],
                "amount": Decimal("350.00"),
                "status": PaymentStatus.COMPLETED,
                "method": "cash",
            },
        )
        Invoice.objects.update_or_create(
            clinic=clinic,
            invoice_number="INV-2026-002",
            defaults={
                "patient": patients["nour"],
                "status": InvoiceStatus.ISSUED,
                "subtotal": Decimal("250.00"),
                "total": Decimal("250.00"),
                "notes": "كشف دوري — بانتظار الدفع",
                "issued_at": timezone.now(),
            },
        )

    def _upsert_notifications(self, clinic, doctor_user, patient_user, appts):
        Notification.objects.filter(clinic=clinic).delete()
        pending = appts.get("pending")
        Notification.objects.create(
            user=doctor_user,
            clinic=clinic,
            notification_type=NotificationType.APPOINTMENT_CREATED,
            title="طلب حجز جديد",
            body=f"طلب حجز موعد من {pending.patient.full_name if pending else 'مريضة'}",
            metadata={"appointment_id": str(pending.id) if pending else ""},
        )
        Notification.objects.create(
            user=doctor_user,
            clinic=clinic,
            notification_type=NotificationType.FOLLOWUP_REMINDER,
            title="متابعة متأخرة",
            body="سونار الشهر السابع — متأخر 3 أيام",
        )
        Notification.objects.create(
            user=patient_user,
            clinic=clinic,
            notification_type=NotificationType.APPOINTMENT_CONFIRMED,
            title="تم تأكيد موعدك",
            body="تم تأكيد موعدك في عيادة د. سارة",
            metadata={"appointment_id": str(appts["confirmed"].id) if appts.get("confirmed") else ""},
        )
        Notification.objects.create(
            user=patient_user,
            clinic=clinic,
            notification_type=NotificationType.PRESCRIPTION_CREATED,
            title="وصفة طبية جديدة",
            body="تم إصدار وصفة طبية — يمكنك الاطلاع عليها في بوابتك",
        )

    def _next_weekday(self, weekday: int) -> date:
        d = timezone.localdate()
        while d.weekday() != weekday:
            d += timedelta(days=1)
        return d

    def _print_summary(self, ctx):
        clinic = ctx["clinic"]
        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(self.style.SUCCESS("  Demo data seeded successfully"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"\n  Clinic slug: {clinic.slug}")
        self.stdout.write(f"  Public page: http://localhost:5173/{clinic.slug}")
        self.stdout.write(f"  Booking:     http://localhost:5173/{clinic.slug}/book")
        self.stdout.write("\n  Accounts (password for all: Demo1234!):")
        self.stdout.write("    dr_sara  -> Doctor dashboard")
        self.stdout.write("    fatima   -> Patient portal (Fatima)")
        self.stdout.write("    nour     -> Patient portal (Nour)")
        self.stdout.write("\n  Seeded: 3 patients, 5 appointments, 1 visit, 2 prescriptions,")
        self.stdout.write("          3 follow-ups, 3 files, 1 pregnancy, 2 invoices, 4 notifications")
        self.stdout.write("")
