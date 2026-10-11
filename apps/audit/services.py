"""Audit logging service."""

from apps.audit.models import AuditLog


def log_action(*, clinic, actor, action, resource_type, resource_id=None, ip_address=None, metadata=None):
    """Create append-only audit log entry."""
    return AuditLog.objects.create(
        clinic=clinic,
        actor=actor,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        metadata=metadata or {},
    )
