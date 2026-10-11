from rest_framework import viewsets

from apps.billing.models import Invoice, Payment
from apps.billing.serializers import InvoiceSerializer, PaymentSerializer
from apps.rbac.permissions import make_permission_class
from apps.tenancy.mixins import TenantViewSetMixin
from apps.tenancy.permissions import IsClinicMember


class InvoiceViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("billing.view")]
    serializer_class = InvoiceSerializer

    def get_queryset(self):
        return super().get_queryset().prefetch_related("lines").order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())


class PaymentViewSet(TenantViewSetMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    permission_classes = [IsClinicMember, make_permission_class("billing.manage")]
    serializer_class = PaymentSerializer

    def perform_create(self, serializer):
        serializer.save(clinic=self.get_clinic())
