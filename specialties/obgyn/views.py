from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember
from specialties.obgyn.models import Pregnancy, PregnancyVisit
from specialties.obgyn.serializers import (
    PregnancySerializer,
    PregnancyVisitSerializer,
    RiskFactorSerializer,
    UltrasoundRecordSerializer,
)
from specialties.obgyn.services.calculations import ObgynCalculationsService


class PregnancyViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Pregnancy.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("obgyn.pregnancy.view")]
    serializer_class = PregnancySerializer

    def get_queryset(self):
        qs = super().get_queryset()
        patient_id = self.request.query_params.get("patient")
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
        return qs.order_by("-created_at")

    def get_permissions(self):
        if self.action == "create":
            return [IsClinicMember(), make_permission_class("obgyn.pregnancy.create")()]
        if self.action in ("update", "partial_update", "destroy"):
            return [IsClinicMember(), make_permission_class("obgyn.pregnancy.edit")()]
        return super().get_permissions()

    def perform_create(self, serializer):
        lmp = serializer.validated_data.get("lmp_date")
        edd = serializer.validated_data.get("edd_date")
        if lmp and not edd:
            edd = ObgynCalculationsService.calculate_edd(lmp)
        serializer.save(clinic=self.get_clinic(), edd_date=edd)

    @action(detail=True, methods=["get"])
    def dashboard(self, request, pk=None):
        pregnancy = self.get_object()
        ga = None
        if pregnancy.lmp_date:
            weeks, days = ObgynCalculationsService.calculate_gestational_age(pregnancy.lmp_date)
            ga = {"weeks": weeks, "days": days}

        return Response({
            "pregnancy": PregnancySerializer(pregnancy).data,
            "gestational_age": ga,
            "visits": PregnancyVisitSerializer(pregnancy.visits.all(), many=True).data,
            "ultrasounds": UltrasoundRecordSerializer(pregnancy.ultrasounds.all(), many=True).data,
            "risk_factors": RiskFactorSerializer(pregnancy.risk_factors.all(), many=True).data,
        })


class PregnancyVisitViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = PregnancyVisit.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("obgyn.pregnancy.edit")]
    serializer_class = PregnancyVisitSerializer

    def perform_create(self, serializer):
        pregnancy = serializer.validated_data["pregnancy"]
        lmp = pregnancy.lmp_date
        ga_weeks, ga_days = (None, None)
        if lmp:
            ga_weeks, ga_days = ObgynCalculationsService.calculate_gestational_age(
                lmp, serializer.validated_data.get("visit_date", lmp)
            )
        serializer.save(
            clinic=self.get_clinic(),
            patient=pregnancy.patient,
            gestational_age_weeks=ga_weeks,
            gestational_age_days=ga_days,
        )
