# Generated manually for pediatrics immunization

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("pediatrics", "0001_initial"),
        ("patients", "0001_initial"),
        ("tenancy", "0003_clinic_specialty_code"),
    ]

    operations = [
        migrations.CreateModel(
            name="Immunization",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("vaccine_name", models.CharField(max_length=120)),
                ("dose_number", models.PositiveSmallIntegerField(default=1)),
                ("scheduled_date", models.DateField(blank=True, null=True)),
                ("given_date", models.DateField(blank=True, null=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("given", "Given"),
                            ("due", "Due"),
                            ("overdue", "Overdue"),
                            ("skipped", "Skipped"),
                        ],
                        default="due",
                        max_length=20,
                    ),
                ),
                ("lot_number", models.CharField(blank=True, max_length=80)),
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
                        related_name="immunizations",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "pediatrics_immunization",
                "indexes": [
                    models.Index(fields=["clinic", "patient", "status"], name="pediatrics_imm_clinic_idx")
                ],
            },
        ),
    ]
