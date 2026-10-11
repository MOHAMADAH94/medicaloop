# Generated manually for general practice specialty

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
            name="CarePlan",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=255)),
                ("condition", models.CharField(blank=True, max_length=255)),
                ("care_plan", models.TextField()),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("completed", "Completed"),
                            ("on_hold", "On hold"),
                        ],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("start_date", models.DateField()),
                ("review_date", models.DateField(blank=True, null=True)),
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
                        related_name="care_plans",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "general_care_plan",
                "indexes": [
                    models.Index(fields=["clinic", "patient", "start_date"], name="general_care_clinic_idx")
                ],
            },
        ),
    ]
