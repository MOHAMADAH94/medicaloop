from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import log_action
from apps.rbac.permissions import make_permission_class
from apps.rbac.services import get_user_permissions
from apps.tenancy.permissions import IsClinicMember

from .models import Permission, Role
from .serializers import PermissionSerializer, RoleSerializer


class PermissionListView(ListAPIView):
    """Catalog of every permission the platform understands."""

    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsClinicMember, make_permission_class("staff.manage")]
    pagination_class = None


class MyPermissionsView(APIView):
    """Permissions the signed-in user holds at the active clinic."""

    permission_classes = [IsClinicMember]

    def get(self, request):
        return Response({"permissions": sorted(get_user_permissions(request.user, request.clinic))})


class RoleViewSet(viewsets.ModelViewSet):
    """System role templates (read-only) plus custom roles owned by this clinic."""

    serializer_class = RoleSerializer
    permission_classes = [IsClinicMember, make_permission_class("staff.manage")]
    pagination_class = None

    def get_clinic(self):
        return getattr(self.request, "clinic", None)

    def get_queryset(self):
        clinic = self.get_clinic()
        if clinic is None:
            return Role.objects.none()
        return (
            Role.objects.filter(Q(clinic__isnull=True) | Q(clinic=clinic))
            .annotate(member_count=Count("memberships", filter=Q(memberships__clinic=clinic), distinct=True))
            .prefetch_related("permissions")
            .order_by("-is_system", "name")
        )

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "clinic": self.get_clinic()}

    def _reject_system_role(self, instance):
        if instance.is_system:
            raise PermissionDenied("System roles are shared templates and cannot be modified.")

    def perform_create(self, serializer):
        role = serializer.save(clinic=self.get_clinic(), is_system=False)
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="role.created",
            resource_type="Role",
            resource_id=role.id,
            metadata={"slug": role.slug},
        )

    def perform_update(self, serializer):
        self._reject_system_role(serializer.instance)
        role = serializer.save()
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="role.updated",
            resource_type="Role",
            resource_id=role.id,
            metadata={"slug": role.slug},
        )

    def perform_destroy(self, instance):
        self._reject_system_role(instance)
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="role.deleted",
            resource_type="Role",
            resource_id=instance.id,
            metadata={"slug": instance.slug},
        )
        instance.delete()
