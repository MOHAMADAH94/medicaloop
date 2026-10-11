from rest_framework import viewsets

from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(TenantViewSetMixin, viewsets.ReadOnlyModelViewSet):
    """Append-only activity trail for the active clinic."""

    queryset = AuditLog.objects.select_related("actor")
    serializer_class = AuditLogSerializer
    permission_classes = [IsClinicMember, make_permission_class("staff.manage")]
    filterset_fields = ["action", "resource_type"]
    search_fields = ["action", "resource_type"]
    ordering = ["-created_at"]
