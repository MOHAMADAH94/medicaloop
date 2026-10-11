from django.contrib import admin

from .models import Invoice, InvoiceLine, Payment


class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 0


class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("patient", "clinic", "total", "status", "created_at")
    list_filter = ("status", "clinic")
    search_fields = ("patient__first_name", "patient__last_name")
    inlines = [InvoiceLineInline, PaymentInline]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("invoice", "clinic", "amount", "method", "created_at")
    list_filter = ("method", "clinic")
