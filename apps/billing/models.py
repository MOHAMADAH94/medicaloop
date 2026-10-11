from django.db import models

from apps.core.constants import InvoiceStatus, PaymentStatus
from apps.tenancy.models import TenantModel


class Invoice(TenantModel):
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="invoices",
    )
    appointment = models.ForeignKey(
        "appointments.Appointment",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    invoice_number = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.DRAFT,
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    issued_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "billing_invoice"
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "invoice_number"],
                name="unique_invoice_number_per_clinic",
            ),
        ]


class InvoiceLine(TenantModel):
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    service = models.ForeignKey(
        "tenancy.ClinicService",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "billing_invoice_line"

    def save(self, *args, **kwargs):
        if self.invoice_id:
            self.clinic_id = self.invoice.clinic_id
        super().save(*args, **kwargs)


class Payment(TenantModel):
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    patient = models.ForeignKey(
        "patients.Patient",
        on_delete=models.CASCADE,
        related_name="payments",
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.COMPLETED,
    )
    method = models.CharField(max_length=50, default="cash")
    reference = models.CharField(max_length=100, blank=True)
    paid_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "billing_payment"

    def save(self, *args, **kwargs):
        if self.invoice_id:
            self.clinic_id = self.invoice.clinic_id
        super().save(*args, **kwargs)
