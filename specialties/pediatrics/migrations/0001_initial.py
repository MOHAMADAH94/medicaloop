# Generated manually for pediatrics specialty

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
            name="GrowthRecord",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("record_date", models.DateField()),
                ("age_months", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("weight_kg", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("height_cm", models.DecimalField(blank=True, decimal_places=1, max_digits=5, null=True)),
                ("head_circumference_cm", models.DecimalField(blank=True, decimal_places=1, max_digits=4, null=True)),
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
                        related_name="growth_records",
                        to="patients.patient",
                    ),
                ),
            ],
            options={
                "db_table": "pediatrics_growth_record",
                "indexes": [
                    models.Index(fields=["clinic", "patient", "record_date"], name="pediatrics__clinic__idx")
                ],
            },
        ),
    ]
