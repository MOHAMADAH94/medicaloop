from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.models import ClinicHoliday, ClinicService, ClinicSettings, WorkingHours
from apps.tenancy.permissions import IsClinicMember
from apps.tenancy.serializers_settings import (
    ClinicHolidaySerializer,
    ClinicServiceSerializer,
    ClinicSettingsSerializer,
    WorkingHoursSerializer,
)
from apps.tenancy.theme import clinic_branding


class ClinicSettingsViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = ClinicSettings.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("settings.manage")]
    serializer_class = ClinicSettingsSerializer
    http_method_names = ["get", "patch", "put"]

    def get_object(self):
        obj, _ = ClinicSettings.objects.get_or_create(clinic=self.get_clinic())
        return obj

    def _payload(self, obj):
        data = ClinicSettingsSerializer(obj).data
        data["branding"] = clinic_branding(self.get_clinic(), obj.theme_color)
        return data

    @action(detail=False, methods=["get", "patch"])
    def current(self, request):
        obj = self.get_object()
        if request.method == "GET":
            return Response(self._payload(obj))
        serializer = ClinicSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(self._payload(serializer.instance))


class WorkingHoursViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = WorkingHours.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("settings.manage")]
    serializer_class = WorkingHoursSerializer

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())


class ClinicHolidayViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = ClinicHoliday.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("settings.manage")]
    serializer_class = ClinicHolidaySerializer

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())


class ClinicServiceViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = ClinicService.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("settings.manage")]
    serializer_class = ClinicServiceSerializer

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())
