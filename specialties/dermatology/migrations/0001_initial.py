# Generated manually for dermatology specialty

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("patients", "0001_initial"),
        ("tenancy", "0003_clinic_specialty_code"),
    ]

    operations = [
        migrations.CreateModel(
            name="SkinCase",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("case_date", models.DateField()),
                ("body_area", models.CharField(max_length=120)),
                ("diagnosis", models.CharField(max_length=255)),
                ("treatment_plan", models.TextField(blank=True)),
                (
                    "severity",
                    models.CharField(
                        choices=[("mild", "Mild"), ("moderate", "Moderate"), ("severe", "Severe")],
                        default="mild",
                        max_length=20,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("resolved", "Resolved")],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True)),
                (
                    "visibility",
                    models.CharField(
                        choices=[("private", "Private"), ("patient_visible", "Patient Visible")],
                        default="patient_visible",
                        max_length=20,
                    ),
                ),
                (
                    "clinic",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s_set",
                        to="tenancy.clinic",
                    ),
                ),
                (
                    "patient",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="skin_cases",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "dermatology_skin_case",
                "indexes": [
                    models.Index(fields=["clinic", "patient", "case_date"], name="dermatology_case_clinic_idx")
                ],
            },
        ),
    ]
