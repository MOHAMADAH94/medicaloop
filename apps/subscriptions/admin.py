from django.contrib import admin

from .models import ClinicSubscription, PlanFeature, SubscriptionPlan


class PlanFeatureInline(admin.TabularInline):
    model = PlanFeature
    extra = 0


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "price_monthly", "max_patients", "max_staff", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [PlanFeatureInline]


@admin.register(ClinicSubscription)
class ClinicSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("clinic", "plan", "status", "trial_ends_at", "current_period_end")
    list_filter = ("status", "plan")
    search_fields = ("clinic__name",)
    autocomplete_fields = ("clinic",)
