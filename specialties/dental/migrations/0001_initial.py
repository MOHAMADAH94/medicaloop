# Generated manually for dental specialty

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
            name="DentalTreatment",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("treatment_date", models.DateField()),
                ("tooth_number", models.CharField(blank=True, max_length=10)),
                ("procedure", models.CharField(max_length=255)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("planned", "Planned"),
                            ("in_progress", "In progress"),
                            ("completed", "Completed"),
                        ],
                        default="planned",
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
                        related_name="dental_treatments",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "dental_treatment",
                "indexes": [
                    models.Index(fields=["clinic", "patient", "treatment_date"], name="dental_treat_clinic_idx")
                ],
            },
        ),
    ]
