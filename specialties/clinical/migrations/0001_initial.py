# Generated manually

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
            name="SpecialtyRecord",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("specialty_code", models.CharField(db_index=True, max_length=50)),
                ("record_date", models.DateField()),
                ("title", models.CharField(max_length=255)),
                ("diagnosis", models.CharField(blank=True, max_length=255)),
                ("findings", models.TextField(blank=True)),
                ("treatment_plan", models.TextField(blank=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("active", "Active"),
                            ("follow_up", "Follow up"),
                            ("completed", "Completed"),
                            ("on_hold", "On hold"),
                        ],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("severity", models.CharField(blank=True, max_length=20)),
                ("metadata", models.JSONField(blank=True, default=dict)),
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
                        related_name="specialty_records",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "specialty_clinical_record",
                "indexes": [
                    models.Index(fields=["clinic", "specialty_code", "patient", "record_date"], name="spec_clin_rec_idx"),
                    models.Index(fields=["clinic", "specialty_code", "status"], name="spec_clin_stat_idx"),
                ],
            },
        ),
    ]
