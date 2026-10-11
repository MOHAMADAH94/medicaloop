from django.db import models

from apps.core.models import BaseModel
from specialties.base.catalog import specialty_field_choices


class Clinic(BaseModel):
    """A tenant clinic — the root isolation boundary."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to="clinics/logos/", blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, default="SA")
    is_active = models.BooleanField(default=True)
    timezone = models.CharField(max_length=50, default="Asia/Riyadh")
    specialty_code = models.CharField(
        max_length=50,
        default="general",
        db_index=True,
        choices=specialty_field_choices(),
        verbose_name="التخصص",
        help_text="تغيير التخصص يحدّث مساحة عمل العيادة والهوية البصرية.",
    )

    class Meta:
        db_table = "tenancy_clinic"
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


class ClinicMembership(BaseModel):
    """Links a staff user to a clinic with role assignments."""

    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="clinic_memberships",
    )
    is_owner = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    job_title = models.CharField(max_length=100, blank=True)
    roles = models.ManyToManyField("rbac.Role", blank=True, related_name="memberships")

    class Meta:
        db_table = "tenancy_clinic_membership"
        ordering = ["-is_owner", "created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "user"],
                name="unique_clinic_user_membership",
            ),
        ]
        indexes = [
            models.Index(fields=["clinic", "is_active"]),
        ]

    def __str__(self):
        return f"{self.user.username} @ {self.clinic.name}"


class DoctorProfile(BaseModel):
    """Extended profile for doctors within a clinic."""

    clinic = models.ForeignKey(
        Clinic,
        on_delete=models.CASCADE,
        related_name="doctors",
    )
    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="doctor_profile",
    )
    specialty = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="doctors/photos/", blank=True, null=True)
    license_number = models.CharField(max_length=100, blank=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        db_table = "tenancy_doctor_profile"
        indexes = [
            models.Index(fields=["clinic", "is_public"]),
        ]

    def __str__(self):
        return f"Dr. {self.user.full_name} — {self.clinic.name}"
