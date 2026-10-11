from django import forms
from django.contrib import admin

from specialties.base.catalog import specialty_field_choices

from .models import (
    Clinic,
    ClinicHoliday,
    ClinicMembership,
    ClinicService,
    ClinicSettings,
    DoctorProfile,
    WorkingHours,
)


class ClinicAdminForm(forms.ModelForm):
    specialty_code = forms.ChoiceField(
        label="التخصص",
        choices=specialty_field_choices(),
        widget=forms.Select(attrs={"style": "min-width: 280px;"}),
        help_text="تغيير التخصص يحدّث مساحة عمل العيادة والهوية البصرية ويضيف خدمات التخصص الجديد.",
    )

    class Meta:
        model = Clinic
        fields = "__all__"


class ClinicSettingsInline(admin.StackedInline):
    model = ClinicSettings
    can_delete = False
    extra = 0
    fields = (
        "appointment_duration_minutes",
        "max_daily_appointments",
        "auto_confirm_appointments",
        "cancellation_hours_before",
        "allow_patient_reschedule",
        "theme_color",
        "onboarding_completed",
    )


class WorkingHoursInline(admin.TabularInline):
    model = WorkingHours
    extra = 0


class ClinicMembershipInline(admin.TabularInline):
    model = ClinicMembership
    extra = 0
    autocomplete_fields = ("user",)
    filter_horizontal = ("roles",)


@admin.register(Clinic)
class ClinicAdmin(admin.ModelAdmin):
    form = ClinicAdminForm
    list_display = ("name", "slug", "specialty_code", "city", "is_active", "created_at")
    list_filter = ("is_active", "specialty_code", "country")
    search_fields = ("name", "slug", "email")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ClinicSettingsInline, WorkingHoursInline, ClinicMembershipInline]
    fieldsets = (
        ("العيادة", {"fields": ("name", "slug", "description", "logo")}),
        (
            "التخصص",
            {
                "fields": ("specialty_code",),
                "description": "تغيير التخصص يحدّث مساحة عمل العيادة والهوية البصرية ويضيف خدمات التخصص الجديد.",
            },
        ),
        ("التواصل", {"fields": ("phone", "email", "address", "city", "country", "timezone")}),
        ("الحالة", {"fields": ("is_active",)}),
    )

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        if db_field.name == "specialty_code":
            kwargs["widget"] = forms.Select(attrs={"style": "min-width: 280px;"})
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        previous = None
        if change:
            previous = Clinic.objects.filter(pk=obj.pk).values_list("specialty_code", flat=True).first()
        super().save_model(request, obj, form, change)
        if previous and previous != obj.specialty_code:
            from apps.tenancy.services_specialty import apply_specialty_side_effects

            apply_specialty_side_effects(
                obj,
                previous_code=previous,
                actor=request.user if request.user.is_authenticated else None,
                request=request,
            )


@admin.register(ClinicMembership)
class ClinicMembershipAdmin(admin.ModelAdmin):
    list_display = ("user", "clinic", "job_title", "is_owner", "is_active")
    list_filter = ("is_owner", "is_active", "clinic")
    search_fields = ("user__username", "user__first_name", "user__last_name", "clinic__name")
    autocomplete_fields = ("user",)
    filter_horizontal = ("roles",)


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "clinic", "specialty", "is_public")
    list_filter = ("specialty", "is_public", "clinic")
    search_fields = ("user__username", "license_number")
    autocomplete_fields = ("user",)


@admin.register(ClinicSettings)
class ClinicSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "clinic",
        "appointment_duration_minutes",
        "max_daily_appointments",
        "auto_confirm_appointments",
        "theme_color",
        "onboarding_completed",
    )
    list_filter = ("auto_confirm_appointments", "onboarding_completed")
    search_fields = ("clinic__name",)


@admin.register(WorkingHours)
class WorkingHoursAdmin(admin.ModelAdmin):
    list_display = ("clinic", "day_of_week", "start_time", "end_time", "is_active")
    list_filter = ("day_of_week", "is_active", "clinic")


@admin.register(ClinicHoliday)
class ClinicHolidayAdmin(admin.ModelAdmin):
    list_display = ("clinic", "date", "reason")
    list_filter = ("clinic",)
    date_hierarchy = "date"


@admin.register(ClinicService)
class ClinicServiceAdmin(admin.ModelAdmin):
    list_display = ("name", "clinic", "price", "duration_minutes", "is_public", "is_active")
    list_filter = ("is_public", "is_active", "clinic")
    search_fields = ("name",)
