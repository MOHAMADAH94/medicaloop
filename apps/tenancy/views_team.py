from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.audit.services import log_action
from apps.core.constants import UserType
from apps.rbac.models import Role
from apps.rbac.permissions import make_permission_class
from apps.subscriptions.models import ClinicSubscription

from .mixins import TenantViewSetMixin
from .models import ClinicMembership
from .permissions import IsClinicMember
from .serializers_team import ClinicMemberSerializer, InviteMemberSerializer

User = get_user_model()


class ClinicMemberViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    """Manage the clinic's staff roster and their role assignments."""

    queryset = ClinicMembership.objects.select_related("user").prefetch_related("roles")
    serializer_class = ClinicMemberSerializer
    permission_classes = [IsClinicMember, make_permission_class("staff.manage")]
    http_method_names = ["get", "post", "patch", "delete"]

    def assignable_roles(self):
        """System role templates plus roles defined by this clinic."""
        return Role.objects.filter(Q(clinic__isnull=True) | Q(clinic=self.get_clinic()))

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "assignable_roles": self.assignable_roles()}

    def _check_seat_available(self):
        subscription = (
            ClinicSubscription.objects.filter(clinic=self.get_clinic())
            .select_related("plan")
            .first()
        )
        limit = subscription.plan.max_staff if subscription and subscription.plan else None
        if limit is None:
            return
        if self.get_queryset().filter(is_active=True).count() >= limit:
            raise ValidationError(
                {"detail": f"Staff seat limit reached for the current plan ({limit})."}
            )

    @action(detail=False, methods=["post"])
    def invite(self, request):
        serializer = InviteMemberSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        clinic = self.get_clinic()

        self._check_seat_available()

        with transaction.atomic():
            user = data["_existing_user"]
            account_created = user is None
            if account_created:
                user = User.objects.create_user(
                    username=data["username"],
                    password=data["password"],
                    email=data.get("email", ""),
                    first_name=data.get("first_name", ""),
                    last_name=data.get("last_name", ""),
                    phone=data.get("phone", ""),
                    user_type=UserType.STAFF,
                )

            membership, membership_created = ClinicMembership.objects.get_or_create(
                clinic=clinic,
                user=user,
                defaults={"job_title": data.get("job_title", ""), "is_active": True},
            )
            if not membership_created:
                membership.is_active = True
                if data.get("job_title"):
                    membership.job_title = data["job_title"]
                membership.save(update_fields=["is_active", "job_title"])

            if data.get("role_ids"):
                membership.roles.set(data["role_ids"])

        log_action(
            clinic=clinic,
            actor=request.user,
            action="staff.invited",
            resource_type="ClinicMembership",
            resource_id=membership.id,
            metadata={"username": user.username, "account_created": account_created},
        )

        return Response(
            ClinicMemberSerializer(membership).data,
            status=status.HTTP_201_CREATED if membership_created else status.HTTP_200_OK,
        )

    def perform_update(self, serializer):
        membership = serializer.instance
        if membership.is_owner and serializer.validated_data.get("is_active") is False:
            raise PermissionDenied("The clinic owner cannot be deactivated.")

        membership = serializer.save()
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="staff.updated",
            resource_type="ClinicMembership",
            resource_id=membership.id,
        )

    def perform_destroy(self, instance):
        if instance.is_owner:
            raise PermissionDenied("The clinic owner cannot be removed.")

        instance.is_active = False
        instance.save(update_fields=["is_active"])
        log_action(
            clinic=self.get_clinic(),
            actor=self.request.user,
            action="staff.deactivated",
            resource_type="ClinicMembership",
            resource_id=instance.id,
        )
