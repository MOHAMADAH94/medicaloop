"""Shared enumerations used across the platform."""

from django.db import models


class Visibility(models.TextChoices):
    PRIVATE = "private", "Private"
    PATIENT_VISIBLE = "patient_visible", "Patient Visible"


class UserType(models.TextChoices):
    STAFF = "staff", "Staff"
    PATIENT = "patient", "Patient"


class AppointmentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    CONFIRMED = "confirmed", "Confirmed"
    CANCELLED = "cancelled", "Cancelled"
    RESCHEDULED = "rescheduled", "Rescheduled"
    ARRIVED = "arrived", "Arrived"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    NO_SHOW = "no_show", "No Show"


class VisitStatus(models.TextChoices):
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class FollowUpStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    OVERDUE = "overdue", "Overdue"
    CANCELLED = "cancelled", "Cancelled"


class InvoiceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ISSUED = "issued", "Issued"
    PAID = "paid", "Paid"
    PARTIAL = "partial", "Partially Paid"
    CANCELLED = "cancelled", "Cancelled"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


class PregnancyStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    DELIVERED = "delivered", "Delivered"
    LOST = "lost", "Lost"
    CANCELLED = "cancelled", "Cancelled"


class NotificationType(models.TextChoices):
    APPOINTMENT_CREATED = "appointment.created", "Appointment Created"
    APPOINTMENT_CONFIRMED = "appointment.confirmed", "Appointment Confirmed"
    APPOINTMENT_CANCELLED = "appointment.cancelled", "Appointment Cancelled"
    APPOINTMENT_REMINDER = "appointment.reminder", "Appointment Reminder"
    FOLLOWUP_REMINDER = "followup.reminder", "Follow-up Reminder"
    PRESCRIPTION_CREATED = "prescription.created", "Prescription Created"
    FILE_PUBLISHED = "file.published", "File Published"
    DOCTOR_MESSAGE = "doctor.message", "Doctor Message"
    SYSTEM = "system", "System"
