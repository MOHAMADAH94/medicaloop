from rest_framework import serializers

from apps.billing.models import Invoice, InvoiceLine, Payment


class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = ("id", "service", "description", "quantity", "unit_price", "total")


class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = (
            "id",
            "patient",
            "appointment",
            "invoice_number",
            "status",
            "subtotal",
            "discount",
            "total",
            "notes",
            "issued_at",
            "lines",
            "created_at",
        )


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ("id", "invoice", "patient", "amount", "status", "method", "reference", "paid_at")
