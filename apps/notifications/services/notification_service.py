"""Event-driven notification service."""

from apps.notifications.models import Notification


class NotificationService:
    @staticmethod
    def notify(*, user, clinic, notification_type, title, body, metadata=None):
        return Notification.objects.create(
            user=user,
            clinic=clinic,
            notification_type=notification_type,
            title=title,
            body=body,
            metadata=metadata or {},
        )

    @staticmethod
    def notify_appointment_created(appointment):
        from apps.core.constants import NotificationType

        if appointment.created_by and appointment.created_by.user_type == "patient":
            for membership in appointment.clinic.memberships.filter(is_active=True).select_related("user"):
                NotificationService.notify(
                    user=membership.user,
                    clinic=appointment.clinic,
                    notification_type=NotificationType.APPOINTMENT_CREATED,
                    title="موعد جديد",
                    body=f"طلب حجز موعد من {appointment.patient.full_name}",
                    metadata={"appointment_id": str(appointment.id)},
                )

    @staticmethod
    def notify_appointment_confirmed(appointment):
        from apps.core.constants import NotificationType

        if appointment.patient.user:
            NotificationService.notify(
                user=appointment.patient.user,
                clinic=appointment.clinic,
                notification_type=NotificationType.APPOINTMENT_CONFIRMED,
                title="تم تأكيد الموعد",
                body=f"تم تأكيد موعدك في {appointment.clinic.name}",
                metadata={"appointment_id": str(appointment.id)},
            )
