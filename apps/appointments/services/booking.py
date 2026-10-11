from datetime import datetime, timedelta

from django.db import transaction
from django.utils import timezone

from apps.appointments.models import Appointment
from apps.core.constants import AppointmentStatus
from apps.tenancy.models import ClinicHoliday, ClinicSettings, WorkingHours


class SlotService:
    """Generate available appointment slots for a clinic."""

    def __init__(self, clinic):
        self.clinic = clinic
        self.settings = ClinicSettings.objects.filter(clinic=clinic).first()
        self.duration = self.settings.appointment_duration_minutes if self.settings else 30
        self.max_daily = self.settings.max_daily_appointments if self.settings else 20

    def get_available_slots(self, date, doctor=None) -> list[dict]:
        if ClinicHoliday.objects.filter(clinic=self.clinic, date=date).exists():
            return []

        day_of_week = date.weekday()
        hours_qs = WorkingHours.objects.filter(
            clinic=self.clinic,
            day_of_week=day_of_week,
            is_active=True,
        )
        if doctor:
            hours_qs = hours_qs.filter(doctor=doctor)

        working_periods = list(hours_qs)
        if not working_periods:
            return []

        existing = Appointment.objects.filter(
            clinic=self.clinic,
            scheduled_start__date=date,
        ).exclude(status=AppointmentStatus.CANCELLED)

        if doctor:
            existing = existing.filter(doctor=doctor)

        booked_starts = {a.scheduled_start for a in existing}
        if existing.count() >= self.max_daily:
            return []

        slots = []
        for period in working_periods:
            current = datetime.combine(date, period.start_time)
            end = datetime.combine(date, period.end_time)
            if timezone.is_naive(current):
                current = timezone.make_aware(current)
                end = timezone.make_aware(end)

            while current + timedelta(minutes=self.duration) <= end:
                if current not in booked_starts and current > timezone.now():
                    slots.append({
                        "start": current.isoformat(),
                        "end": (current + timedelta(minutes=self.duration)).isoformat(),
                    })
                current += timedelta(minutes=self.duration)

        return slots


class BookingService:
    """Handle appointment booking with double-book prevention."""

    def __init__(self, clinic):
        self.clinic = clinic

    @transaction.atomic
    def create_appointment(self, *, patient, scheduled_start, doctor=None, service=None, created_by=None):
        settings = ClinicSettings.objects.filter(clinic=self.clinic).first()
        duration = settings.appointment_duration_minutes if settings else 30
        scheduled_end = scheduled_start + timedelta(minutes=duration)

        conflict = Appointment.objects.select_for_update().filter(
            clinic=self.clinic,
            doctor=doctor,
            scheduled_start=scheduled_start,
        ).exclude(status=AppointmentStatus.CANCELLED).exists()

        if conflict:
            raise ValueError("This time slot is no longer available.")

        if settings and settings.auto_confirm_appointments:
            appt_status = AppointmentStatus.CONFIRMED
        else:
            appt_status = AppointmentStatus.PENDING

        return Appointment.objects.create(
            clinic=self.clinic,
            patient=patient,
            doctor=doctor,
            service=service,
            scheduled_start=scheduled_start,
            scheduled_end=scheduled_end,
            status=appt_status,
            created_by=created_by,
        )
