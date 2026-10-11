from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.constants import FollowUpStatus
from apps.followups.models import FollowUpItem, FollowUpPlan
from apps.followups.serializers import FollowUpItemSerializer, FollowUpPlanSerializer
from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember


class FollowUpPlanViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = FollowUpPlan.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("medical_records.view")]
    serializer_class = FollowUpPlanSerializer

    def get_queryset(self):
        qs = super().get_queryset().prefetch_related("items")
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())


class FollowUpItemViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = FollowUpItem.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("medical_records.create")]
    serializer_class = FollowUpItemSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by("due_date")

    def perform_create(self, serializer):
        plan = FollowUpPlan.objects.get(id=self.request.data.get("plan"))
        serializer.save(clinic=self.get_clinic(), patient=plan.patient, plan=plan)

    @action(detail=False, methods=["get"])
    def overdue(self, request):
        qs = self.get_queryset().filter(
            status__in=[FollowUpStatus.PENDING, FollowUpStatus.IN_PROGRESS],
            due_date__lt=timezone.localdate(),
        )
        return Response(FollowUpItemSerializer(qs, many=True).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        item = self.get_object()
        item.status = FollowUpStatus.COMPLETED
        item.completed_at = timezone.now()
        item.save(update_fields=["status", "completed_at", "updated_at"])
        return Response(FollowUpItemSerializer(item).data)
